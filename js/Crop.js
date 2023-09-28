import { ITEM_DATA, WORLD_DATA, saveWorldData } from "./GameData.js";

export default class Crop extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, name } = data;
        let frame = ITEM_DATA[name].frame + "1";
        super(scene.matter.world, x, y, ITEM_DATA[name].texture, frame)
        
        console.log(x, y)
        this.tx = x;
        this.ty = y;

        this.name = name;
        this.x = this.x * 32 + 16
        this.y = this.y * 32 + 16 - 7;
        this.depth = this.y;

        const { Bodies } = Phaser.Physics.Matter.Matter;
        let circleCollider = Bodies.circle(this.x, this.y, 10, { isSensor: true, label: "cropSensor" })
        this.setExistingBody(circleCollider);
        this.setStatic(true);
        this.scene.add.existing(this);

        // Soil
        this.soil = new Phaser.GameObjects.Sprite(this.scene, this.x, this.y + 7, 'crops', "soil");
        this.soil.depth = this.y - 32;
        this.scene.add.existing(this.soil);



        // variables
        this.plantTime = Date.now();
        this.progressBarWidth = 0;
        this.timeGrowed = 0;
        this.is_hovered = false;
        this.is_growing = true;
        
        
        
        this.postFxPlugin = this.scene.plugins.get('rexoutlinepipelineplugin');
        this.setInteractive()
        this.on('pointerover', function () {
            // Add postfx pipeline
            this.postFxPlugin.add(this, {
                thickness: 1,
                outlineColor: 0xFFE50C
            });
            this.createProgressBar();
            this.is_hovered = true;

        })
        this.on('pointerout', function () {
            // Remove all outline post-fx pipelines
            this.postFxPlugin.remove(this);
            this.destroyProgressBar()
            this.is_hovered = false;
        })
        this.on("pointerdown", function() {
            console.log("clicked", this)
            
            for (let [key, value] of Object.entries(ITEM_DATA[this.name].drops)){
                this.scene.inventory.addItem(key, value)
            } 
            this.destroySelf();
        })

    }    

    static preload(scene) {
        scene.load.atlas("crops", "assets/images/crops.png", "assets/images/crops_atlas.json");
    }

    update(currentTime) {
        let remainingTime = Math.ceil(ITEM_DATA[this.name].growingTime - (currentTime - this.plantTime) / 1000);

        if (!this.is_growing) {
            let index = this.scene.growingCrops.indexOf(this)
            if (index != undefined) {
                this.scene.growingCrops.splice(index, 1);
            }
        }

        // Update texture and progress bar
        if (remainingTime > 0) {
            this.timeGrowed = (currentTime - this.plantTime) / 1000;

            // texture
            let phraseTime = (ITEM_DATA[this.name].growingTime / 3)
            let textureNum = Math.ceil(this.timeGrowed / phraseTime).toString();
            let textureName = ITEM_DATA[this.name].frame + textureNum;
            this.setTexture(ITEM_DATA[this.name].texture, textureName)

            if (this.is_hovered) {
                // Update progress bards
                this.destroyProgressBar();
                this.createProgressBar();
            } else {
                this.destroyProgressBar();
            }
            
        } else {
            this.setTexture(ITEM_DATA[this.name].texture, ITEM_DATA[this.name].frame + "4")
            this.timeGrowed = ITEM_DATA[this.name].growingTime;
            this.is_growing = false;
        }

    }

    createProgressBar() {
        // Progress Bar
        this.graphics = this.scene.add.graphics();
        this.graphics.fillStyle(0x000000, 1);
        this.progressBarBackground = this.graphics.fillRoundedRect(this.x - this.displayWidth / 2, this.y - this.displayHeight / 2, this.displayWidth, 6, 2); // x, y, width, height, radius
        this.progressBarBackground.depth = this.depth + 1;
        this.graphics.fillStyle(0x0000ff, 1);

        // console.log(this.timeGrowed)
        this.progressBarWidth = (this.displayWidth - 4) * (this.timeGrowed / ITEM_DATA[this.name].growingTime);
        this.progressBar = this.graphics.fillRoundedRect(this.x - this.displayWidth / 2 + 2, this.y - this.displayHeight / 2 + 2, this.progressBarWidth, 6 - 4, 1); // x, y, width, height, radius
        this.progressBar.depth = this.depth + 2;
    }

    destroyProgressBar() {
        this.progressBarBackground?.destroy();
        this.progressBar?.destroy();
    }

    destroySelf() {
        let index = this.scene.growingCrops.indexOf(this)
        if (this.is_growing && index != undefined) {
            this.scene.growingCrops.splice(index, 1);
        }
        this.postFxPlugin?.remove(this);
        this.destroyProgressBar();
        this.destroy();
        this.soil.destroy();
        console.log(`${this.tx},${this.ty}`)
        delete WORLD_DATA[`${this.tx},${this.ty}`];
        saveWorldData();
    }

    // get dead() {
    //     return this.health <= 0;
    // }

    // hit = () => {
    //     if (this.sound) this.sound.play();
    //     this.health--;
    //     console.log(`Hitting: ${this.name} Health: ${this.health}`);
    //     if (this.dead) {
    //         this.drops.forEach(drop => new DropItem({ scene: this.scene, x: this.x, y: this.y, frame: drop }));
    //     }
    // }
}