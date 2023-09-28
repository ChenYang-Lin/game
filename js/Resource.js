import DropItem from "./DropItem.js";
import { ITEM_DATA, WORLD_DATA, saveWorldData } from "./GameData.js";

export default class Resource extends Phaser.Physics.Matter.Sprite {
    static preload(scene) {
        scene.load.atlas("resources", "assets/images/resources/resources_spritesheet.png", "assets/images/resources/resources_spritesheet_atlas.json");
        // scene.load.atlas("resources", "assets/images/resources.png", "assets/images/resources_atlas.json");
        // scene.load.json("shapes", "assets/images/shapes.json"); // For PhysicsEditor
        scene.load.json("shapes", "assets/images/resources/resources_shapes.json"); // For PhysicsEditor
    }

    constructor(data) {
        let { scene, object, shapes } = data;
        // let { tx, ty, type, name, offsetY, drops, is_obstacle, health, maxHP } = { ...object };
        let { tx, ty, name } = { ...object };
        let { type, texture, frame, offsetY, is_obstacle, maxHP, drops } = ITEM_DATA[name];

        super(scene.matter.world, tx * 32, ty * 32, texture, frame, { shape: shapes[name]})

        this.tx = tx,
        this.ty = ty,
        this.type = type,
        this.name = name
        this.drops = drops;
        this.is_obstacle = is_obstacle;
        this.maxHP = maxHP;
        this.health = this.maxHP;

        this.x += 16
        this.y += 16 + offsetY;
        this.scale = 1;
        this.depth = this.y - offsetY;
        this.scene.add.existing(this);
        this.setStatic(true);

        this.is_hovered = false;
        
        
        this.postFxPlugin = this.scene.plugins.get('rexoutlinepipelineplugin');
        this.setInteractive()
        this.on('pointerover', function () {
            // Add postfx pipeline
            this.postFxPlugin.add(this, {
                thickness: 1,
                outlineColor: 0xFFE50C
            });
            this.is_hovered = true;
            this.createHealthBar();            
        })
        this.on('pointerout', function () {
            // Remove all outline post-fx pipelines
            this.postFxPlugin.remove(this);
            this.destroyHealthBar()
            this.is_hovered = false;
        })

    }

    get dead() {
        return this.health <= 0;
    }

    hit = () => {
        if (this.sound) this.sound.play();
        this.health--;
        if (this.is_hovered) {
            this.destroyHealthBar();
            this.createHealthBar();
        } else {
            this.destroyHealthBar();
        }
        console.log(`Hitting: ${this.name} Health: ${this.health}`);
        if (this.dead) {
            for (let [key, value] of Object.entries(this.drops)){
                new DropItem({ scene: this.scene, x: this.x, y: this.y, name: key, quantity: value  })
            } 
        }
    }

    createHealthBar() {
        // Health Bar
        this.graphics = this.scene.add.graphics();
        this.graphics.fillStyle(0x000000, 1);
        this.healthBarBackground = this.graphics.fillRoundedRect(this.x - this.displayWidth / 2, this.y - this.displayHeight / 2, this.displayWidth, 6, 2); // x, y, width, height, radius
        this.healthBarBackground.depth = this.depth + 1;
        this.graphics.fillStyle(0x00ff00, 1);
        let healthBarWidth = (this.displayWidth - 4) * (this.health / this.maxHP);
        this.healthBar = this.graphics.fillRoundedRect(this.x - this.displayWidth / 2 + 2, this.y - this.displayHeight / 2 + 2, healthBarWidth, 6 - 4, 1); // x, y, width, height, radius
        this.healthBar.depth = this.depth + 2;
    }

    destroyHealthBar() {
        this.healthBarBackground?.destroy();
        this.healthBar?.destroy();
    }

    destroySelf() {
        this.destroy();
        this.postFxPlugin?.remove(this);
        this.destroyHealthBar();

        delete WORLD_DATA[`${this.tx},${this.ty}`];
        saveWorldData();
    }
}