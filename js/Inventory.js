import { INVENTORY_DATA, saveInventoryData } from "./GameData.js";
import InventoryScreen from "./InventoryScreen.js";

export default class Inventory {
    constructor(scene) {
        this.scene = scene;
        this.inventory = [];

        for (let [key, value] of Object.entries(INVENTORY_DATA)){
            this.inventory[value.index] = { name: key, quantity: value.quantity };
        } 
        console.log(this.inventory)

        this.inventoryScreen = new InventoryScreen(this.scene, this);
    }

    addItem(name, quantity) {
        if (INVENTORY_DATA[name]) {
            INVENTORY_DATA[name].quantity += quantity;
            this.inventory[INVENTORY_DATA[name].index] += quantity;
        } else {
            // get first empty slot in inventory array
            let openIndex = 0;
            for (let i = 0; i < this.inventory.length; i++) {
                if (this.inventory[i] === null) {
                    openIndex = i;
                    break;
                } else {
                    openIndex = this.inventory.length;
                }
            }
            this.inventory[openIndex] = {
                name: name,
                quantity: quantity,
            }
            INVENTORY_DATA[name] = {
                index: openIndex,
                quantity: quantity,
            }
        }
        saveInventoryData();
        console.log(this)
    }

    swapItems(a, b) {
        let temp = this.inventory[a];

        this.inventory[a] = this.inventory[b];
        this.inventory[b] = temp;
        console.log(this.inventory) 
    } 
}