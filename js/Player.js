

export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        // this.setScale(0.7)
        this.offsetY = 24;
        
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        let playerCollider = Bodies.circle(this.x, this.y + this.offsetY, 10, { isSensor: false, label: "playerCollider" });
        let playerSensor = Bodies.circle(this.x, this.y, 34, { isSensor: true, label: "playerSensor" });
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0,
        });
        this.setExistingBody(compoundBody).setFixedRotation();
        this.scene.add.existing(this);

        
        // this.setOrigin(0.5, 0.1)
        
        
        this.touching = [];
        this.givenPath = []; // if player clicked right mouse button, a path is generated, update function will check for it.
        this.givenDestination;

        this.direction = "right";
        this.is_attacking = false;



        // // // Weapon 
        // this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'items', 162);
        // this.spriteWeapon.setOrigin(0.25, 0.75);
        // this.spriteWeapon.setScale(0.8);
        // this.scene.add.existing(this.spriteWeapon);



        this.createMiningCollisions(playerSensor);
        this.createPickupCollisions(playerCollider);
        this.createSeeThroughCollisions(playerCollider);

        this.scene.input.on("pointermove", pointer => {
            // this.setFlipX(pointer.worldX < this.x);
        })

        this.scene.input.on("pointerdown", pointer => {
            this.attack();
        })
    }

    static preload(scene) {
        scene.load.atlas("female", "assets/images/female.png", "assets/images/female_atlas.json");
        scene.load.animation("female_anim", "assets/images/female_anim.json");
        scene.load.atlas("player", "assets/images/player.png", "assets/images/player_atlas.json");
        scene.load.animation("player_anim", "assets/images/player_anim.json");
    }

    create() {}

    get velocity() {
        return this.body.velocity;
    }

    update() {
        this.depth = this.y;

        // check player direction
        this.updatePlayerDirection();
        this.setVelocity(0,0);
        

        if (!this.is_attacking) {
            // Update player movement
            this.updateMovement();

            // Player animation for idle and walk based on the velocity
            if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
                this.anims.play(`walk_${this.direction}`, true);
            } else {
                this.anims.play(`idle_${this.direction}`, true);
            }
        } else {
            this.anims.play(`attack_${this.direction}`, true);
            // console.log(this.anims.currentAnim.frames.length);
            // console.log(this.anims.currentFrame.frame.name === "attack_right_2");
            // console.log(this.anims.currentFrame);
            if (this.anims.currentFrame.isLast) {
                this.is_attacking = false;
            }
        }
    }

    attack() {
        if (this.is_attacking) return;
        this.is_attacking = true; 
        this.whackStuff();
    }

    updatePlayerDirection() {
        if (Math.abs(this.velocity.x) < Math.abs(this.velocity.y)) {
            if (this.velocity.y > 0) 
                this.direction = "down";
            if (this.velocity.y < 0) 
                this.direction = "up"
            
        } else {
            if (this.velocity.x > 0) 
                this.direction = "right";
            if (this.velocity.x < 0) 
                this.direction = "left"
        }
    }

    updateMovement() {
        const speed = 1.5;
        let playerVelocity = new Phaser.Math.Vector2();

        // If character receive a path command, let player follow the given path
        if (this.givenPath?.length > 0) { // check if character land on destination grid cell
            let nextDestinationGrid = this.givenPath[0]; 
            // If character land on target grid cell, change target to next grid cell in the path
            if (Math.floor(this.x / 32) === nextDestinationGrid.tx && Math.floor(this.y / 32) === nextDestinationGrid.ty) {
                this.givenPath.splice(0, 1);
                return;
            }
            // If character is not in center on the target grid cell, adjust x and y position. 
            if (Math.abs((nextDestinationGrid.tx * 32 + 16) - this.x) > 2) { // since we move character based on the velocity, give it a acceptable range (in this case, two pixels). otherwise it kept moving back and forth.
                if (this.x > nextDestinationGrid.tx * 32 + 16) {
                    playerVelocity.x = -1
                } else {
                    playerVelocity.x = 1
                }
            }
            if (Math.abs((nextDestinationGrid.ty * 32 + 16 - this.offsetY) - this.y) > 2) {
                if (this.y > nextDestinationGrid.ty * 32 + 16 - this.offsetY) {
                    playerVelocity.y = -1
                } else {
                    playerVelocity.y = 1
                }
            }
        } else {
            // Player on the destination grid cell, let it walk to the exact point (x, y) where player clicked on the map.
            if (this.givenDestination !== undefined) {
                // move character to the coordinate (exact x and y) that player clicked in the game
                if (Math.abs(this.x - this.givenDestination.x) > 2) {
                    if (this.x > this.givenDestination.x) {
                        playerVelocity.x = -1;
                    } else {
                        playerVelocity.x = 1;
                    }
                }
                if (Math.abs(this.y - (this.givenDestination.y - this.offsetY)) > 2) {
                    if (this.y > this.givenDestination.y - this.offsetY) {
                        playerVelocity.y = -1;
                    } else {
                        playerVelocity.y = 1;
                    }
                }
                // Reached to the destination
                if (Math.abs(this.x - this.givenDestination.x) < 2 && Math.abs(this.y - (this.givenDestination.y - this.offsetY)) < 2) {
                    this.givenDestination = undefined;
                }
            }
        }

        // Keyboard input movement: "wasd", cancel following path
        if (this.inputKeys.left.isDown) {
            playerVelocity.x = -1;
            this.givenPath = [];
        } else if (this.inputKeys.right.isDown) {
            playerVelocity.x = 1;
            this.givenPath = [];
        }
        if (this.inputKeys.up.isDown) {
            playerVelocity.y = -1;
            this.givenPath = [];
        } else if (this.inputKeys.down.isDown) {
            playerVelocity.y = 1;
            this.givenPath = [];
        }
        playerVelocity.normalize();
        playerVelocity.scale(speed);
        this.setVelocity(playerVelocity.x, playerVelocity.y);
    }


    createMiningCollisions(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: other => {
                if (other.bodyB.isSensor) return;
                this.touching.push(other.gameObjectB);
                console.log(this.touching.length, other.gameObjectB?.name);
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [playerSensor],
            callback: other => {
                if (other.bodyB.isSensor) return;
                this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
                console.log(this.touching.length);
            },
            context: this.scene,
        })
    }

    createPickupCollisions(playerCollider) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerCollider],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.pickup) {
                    other.gameObjectB.pickup();
                }
            }
        });

        this.scene.matterCollision.addOnCollideActive({
            objectA: [playerCollider],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.pickup) {
                    other.gameObjectB.pickup();
                }
            }
        })
    }

    createSeeThroughCollisions(playerCollider) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerCollider],
            callback: other => {
                if (other.bodyB.isSensor && other.bodyB?.label === "transparentTrigger") {
                    other.gameObjectB.setAlpha(0.7);
                };
            }
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA: [playerCollider],
            callback: other => {
                if (other.bodyB.isSensor && other.bodyB?.label === "transparentTrigger") {
                    other.gameObjectB?.setAlpha(1);
                };
            }
        })
    }

    whackStuff() {
        this.touching = this.touching.filter(gameObject => gameObject.hit && !gameObject.dead);
        this.touching.forEach(gameObject => {
            gameObject.hit();
            if (gameObject.dead) {
                gameObject.destroySelf();
            }
        })
    }


}