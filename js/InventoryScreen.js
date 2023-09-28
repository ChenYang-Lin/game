
export default class InventoryScreen {
    
    constructor(scene, inventory) {
        this.scene = scene;
        this.inventory = inventory;

        this.dragIndex = -1;
        this.dropIndex = -1;

        this.itemAtlas = undefined;

        this.inventoryContainer = document.getElementById("inventory-container")

        fetch("assets/images/items_spritesheet_atlas.json")
            .then((response) => response.json())
            .then((json) => {
                this.itemAtlas = json.frames;
                // Init grid cells
                this.initGridCells();
            });
        


        document.getElementById("inventory-close-btn").addEventListener('click', () => {
            this.inventoryContainer.style.display = "none"
        })

        // Inputs
        this.scene.input.keyboard.on('keydown-' + 'I', (event) => {
            console.log(this.inventoryContainer);
            console.log("this.inventoryContainer");
            if (this.inventoryContainer.style.display == "none") {
                this.openInventory();
            } else {
                this.closeInventory();
            }
               
        });

    }

    openInventory() {
        this.inventoryContainer.style.display = "grid"
    }

    closeInventory() {
        this.inventoryContainer.style.display = "none"
    }

    initGridCells() {
        const itemGrids = document.getElementById("item-grids");
        for (let i = 0; i < 20; i++) {
            let empty = document.createElement('div');
            empty.classList.add('grid-cell')

            empty.addEventListener('dragenter', this.dragEnter.bind(this));
            empty.addEventListener('dragleave', this.dragLeave.bind(this));
            empty.addEventListener('drop', this.dragDrop.bind(this));

            itemGrids.appendChild(empty);

            // Draw inventory items
            if (this.inventory.inventory[i] !== undefined) {
                console.log()
                let fill = this.createItemIcon(this.inventory.inventory[i].name, this.inventory.inventory[i].quantity)
                empty.appendChild(fill);
            }
        }
    }

          
        
    dragStart(e) {
        e.target.className += ' hold';
        setTimeout(() => (e.target.parentNode.innerHTML = ""), 0);
        let currentGrid = e.target.parentNode;
        this.dragIndex = Array.from(currentGrid.parentNode.children).indexOf(currentGrid);
    }
    
    dragLeave(e) {
        if (e.target.classList.contains("hovered")) 
            e.target.classList.remove("hovered")
    }
            
    dragDrop(e) {
        e.preventDefault();
        e.target.className = "grid-cell"
    }

    dragEnter(e) {
        e.preventDefault();
        if (e.target.className !== "grid-cell") return;
        e.target.className += " hovered";
        this.dropIndex = Array.from(e.target.parentNode.children).indexOf(e.target);
        console.log(this.dropIndex)
    }

    dragEnd() {
        console.log("dragEnd")
        const items = document.getElementById("item-grids").children
        if (this.dragIndex < 0) return;

        console.log(this.dragIndex)
        console.log(this.dropIndex)
        if (this.dropIndex >= 0) {
            // let fill = this.createItemIcon(this.inventory.inventory[this.dragIndex].name)
            let currItem = this.inventory.inventory[this.dragIndex]
            let fill = this.createItemIcon(currItem.name, currItem.quantity)
            if (this.inventory.inventory[this.dropIndex] !== undefined) {
                items.item(this.dragIndex).appendChild(fill);
            } else {
                items.item(this.dropIndex).appendChild(fill);
            }
            this.inventory.swapItems(this.dragIndex, this.dropIndex);
            console.log(this.inventory.inventory)
        } else {
        }
    }

    createItemIcon(itemName, quantity) {
        let itemIcon = document.createElement('div');
        itemIcon.classList.add("item-icon")
        itemIcon.setAttribute('draggable', true);
        itemIcon.addEventListener('dragstart', this.dragStart.bind(this));
        itemIcon.addEventListener('dragend', this.dragEnd.bind(this));

        let currItem = this.itemAtlas.find(item => {
            return item.filename === itemName
        })

        itemIcon.style.backgroundImage = 'url("assets/images/items_spritesheet.png")'
        itemIcon.style.backgroundPosition = `-${currItem.frame.x}px -${currItem.frame.y}px`
        return itemIcon;
    }
}

