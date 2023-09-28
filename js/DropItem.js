import { ITEM_DATA } from "./GameData.js";

export default class DropItem extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, name, quantity } = data;
        let { type, texture, frame } = ITEM_DATA[name];
        super(scene.matter.world, x, y, texture, frame);
        this.quantity = quantity
        this.name = name;
        this.scene = scene
        console.log(this.scene.inventory)
        this.scene.add.existing(this);

        const { Bodies } = Phaser.Physics.Matter.Matter;
        let circleCollider = Bodies.circle(this.x, this.y, 10, { isSensor: false, label: "collider" })
        this.setExistingBody(circleCollider);
        this.setFrictionAir(1);
        this.setScale(0.5);
    }

    pickup = () => {
        // this.sound?.play();
        console.log("drop", this.name, this.quantity)
        this.scene.inventory.addItem(this.name, this.quantity)
        this.destroy();
        return true;
    }
}