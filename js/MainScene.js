import Crop from "./Crop.js";
import { ITEM_DATA, WORLD_DATA, loadWorldData, saveWorldData, INVENTORY_DATA,  loadInventoryData, saveInventoryData } from "./GameData.js";
import HUD from "./HUD.js";
import Inventory from "./Inventory.js";
import { Astar } from "./Pathfinding.js";
import Player from "./Player.js";
import Resource from "./Resource.js";



export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        Player.preload(this);
        Resource.preload(this);
        Crop.preload(this);

        // Items
        // this.load.spritesheet("items", "assets/images/items.png", { frameWidth: 32, frameHeight: 32 });
        this.load.atlas("items", "assets/images/items_spritesheet.png", "assets/images/items_spritesheet_atlas.json");

        this.load.json("shapes", "assets/images/shapes.json"); // For PhysicsEditor
        this.load.image("tiles", "assets/images/RPG Nature Tileset.png");
        this.load.tilemapTiledJSON("map", "assets/images/map.json");
        this.load.plugin('rexoutlinepipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexoutlinepipelineplugin.min.js', true); // outline plugin
    }

    create() {
        this.timer = 0;
        this.growingCrops = [];

        this.shapes = this.cache.json.get('shapes');

        // Map
        this.map = this.make.tilemap({ key: "map" })
        const tileset = this.map.addTilesetImage("RPG Nature Tileset", "tiles", 32, 32);
        const layer1 = this.map.createLayer("Tile Layer 1", tileset, 0, 0);
        const layer2 = this.map.createLayer("Tile Layer 2", tileset, 0, 0);
        layer1.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer1);

        // Pathfinding
        let astar = new Astar();

        // Initialize or load saved data
        if (localStorage.getItem("WORLD_DATA") === null){
            this.initResources();
        } else {
            loadWorldData();
        }
        if (localStorage.getItem("INVENTORY_DATA") === null){
            saveInventoryData();
        } else {
            loadInventoryData();
        }

        // Inventory
        this.inventory = new Inventory(this);
        this.hud = new HUD(this);
        
        for (let key in WORLD_DATA) {
            
            if (ITEM_DATA[WORLD_DATA[key].name].type === "resource") {
                // REFERENCE
                // let object = {
                //     tx: resource.x / 32,
                //     ty: resource.y / 32 - 1,
                //     type: "resource",
                //     name: resource.properties.find(p => p.name == "type").value,
                //     offsetY: resource.properties.find(p => p.name == "offsetY").value,
                //     drops: JSON.parse(resource.properties.find(p => p.name == "drops").value),
                //     health: 5,
                // }
                new Resource({ scene: this, object: WORLD_DATA[key], shapes: this.shapes })
            } else if (WORLD_DATA[key].type === "crop") {
                let { tx, ty, type, name } = WORLD_DATA[key]
                let crop = new Crop({ scene: this, x: tx, y: ty, name })
                this.growingCrops.push(crop);
            }
        }

        

        // Player
        this.player = new Player({ scene: this, x: 96, y: 32, texture: "player", frame: "player_idle_left" });
        this.player.inputKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        })

        // Camera
        this.camera = this.cameras.main;
        // this.camera.setZoom(2);
        this.camera.startFollow(this.player)
        // this.camera.startFollow(this.player, false);
        this.camera.setLerp(0.3, 0.3);
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Cursor
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, 0xffffff, 1); // this.graphics.lineStyle(thickness, color, alpha)
        this.cursorRect = this.graphics.strokeRect(0, 0, 32, 32);

        // Plant crop
        this.input.on("pointerdown", (pointer) => {
            if (pointer.leftButtonDown()) {
                const { gridX, gridY } = this.getCursorPosition();
                if (WORLD_DATA[`${gridX},${gridY}`] === undefined) {
                    WORLD_DATA[`${gridX},${gridY}`] = { tx: gridX, ty: gridY, type: "crop", name: "carrotseed" }
                    let crop = new Crop({ scene: this, x: gridX, y: gridY, name: "carrotseed" })
                    this.growingCrops.push(crop);
                    saveWorldData();
                }
                
            }

            if (pointer.rightButtonDown()) {
                let {gridX, gridY} = this.getCursorPosition();
                console.log("player position: ", Math.floor(this.player.x / 32), Math.floor(this.player.y / 32), this.player.x, this.player.y)
                let path = astar.findPath(WORLD_DATA, {tx: Math.floor(this.player.x / 32), ty: Math.floor(this.player.y / 32)}, {tx: gridX, ty: gridY}, this)
                this.player.givenPath = path;
                this.player.givenDestination = { x: this.input.mousePointer.x + this.camera.worldView.x, y: this.input.mousePointer.y + this.camera.worldView.y }
            }
        });

    }

    update(time, delta) {
        this.player.update();

        // console.log(this.growingCrops)
        // Crops update
        this.timer += delta;
        if (this.timer >= 500) {
            // console.log(this.growingCrops)
            this.timer = 0;
            this.growingCrops.forEach(crop => {
                crop.update(Date.now());
            })
        }


        // Mouse position
        // this.updateCursorRect();
    }

    initResources() {
        const resources = this.map.getObjectLayer("Resources").objects.forEach( resource => {
            let object = {
                tx: resource.x / 32,
                ty: resource.y / 32 - 1,
                name: resource.properties.find(p => p.name == "type").value,
            }
            WORLD_DATA[`${object.tx},${object.ty}`] = object;
        })
        saveWorldData();
    }

    getCursorPosition() {
        let x = this.input.mousePointer.x + this.camera.worldView.x;
        let y = this.input.mousePointer.y + this.camera.worldView.y;
        let cursorOnGridX = Math.floor(x / 32);
        let cursorOnGridY = Math.floor(y / 32);
        console.log("cursor position: ", cursorOnGridX, cursorOnGridY, x, y);
        return { gridX: cursorOnGridX, gridY: cursorOnGridY}
    }

    updateCursorRect() {
        const { gridX, gridY } = this.getCursorPosition();
        this.cursorRect.x = gridX * 32;
        this.cursorRect.y = gridY * 32;
    }


}