/* 
=====================
    HTML ELEMENTS
=====================
*/

const newItemUI = document.getElementById("newItem");
const itemTitle = document.getElementById("itemTitle");
const itemDesc = document.getElementById("itemDesc");
const itemDate = document.getElementById("itemDate");
const itemTime = document.getElementById("itemTime");

const dueStorage = document.getElementById("dueStorage");
const upcomingStorage = document.getElementById("upcomingStorage");
const completedStorage = document.getElementById("completedStorage");

const dueHeading = document.getElementById("dueHeading");
const upcomingHeading = document.getElementById("upcomingHeading");
const completedHeading = document.getElementById("completedHeading");

const blackScreen = document.getElementById("black");
const colorHolder = document.getElementById("colorHolder");

const resizeButton = document.getElementById("resizeButton");
const minimizeButton = document.getElementById("minimizeButton");
const closeButton = document.getElementById("closeButton");
const newItemButton = document.getElementById("newItemButton");
const createButton = document.getElementById("createButton");

const tipText = document.getElementById("tip");
const arrow = document.getElementById("arrow");

const colorGrid = document.getElementById("colorGrid");
const clearAll = document.getElementById("clear");

/*
=====================
   CONFIG VARIABLES
=====================
*/
const refreshTime = 60;

/* 
=====================
    MAIN VARIABLES
=====================
*/

var assignments = [];

/* 
=====================
   ASSIGNMENT CLASS
=====================
*/

class Assignment {
    constructor(title, desc, dueDate, dueTime, color, completed) {
        this.title = title;
        this.desc = desc;
        this.dueDate = dueDate;
        this.dueTime = dueTime;
        this.color = color;
        this.completed = completed;

        this.element = this.toHTML();
    }

    // Calculates if the item is due within 24 hours (true) else, false
    checkIfDueSoon() {
        //math.abs
        var hourDifference = (getRawDate(this.dueDate, this.dueTime) - getRawDate(getDate(), getTime())) / 3600000;

        if (hourDifference <= 24) {
            return true;
        } else {
            return false;
        }
    }

    compareTo(item) {
        var hourDifference = (getRawDate(this.dueDate, this.dueTime) - getRawDate(item.dueDate, item.dueTime));

        if (hourDifference < 0) {
            return -1;
        } else if (hourDifference > 0) {
            return 1;
        }

        return 0;
    }

    // Places the element in the correct location
    display() {
        var parent = this.element.parentElement;
        if (this.completed) {
            completedStorage.appendChild(this.element);
        } else if (this.checkIfDueSoon()) {
            dueStorage.appendChild(this.element);
        } else {
            upcomingStorage.appendChild(this.element);
        }

        updateContainers();
        return parent == this.element.parentElement ? false : true;
    }

    // Returns the assignment in the form of HTML
    // Note: This is very messy!
    toHTML() {
        // Create the main storage element
        var mainDiv = document.createElement("div");

        // Head Div & Children

        var headDiv = document.createElement("div");
        headDiv.className = "assignment-head";
        headDiv.style.backgroundColor = this.color;

        var titleContent = document.createElement("p");
        titleContent.innerHTML = stripHTML(this.title).replace(/\[(.*?)\]/, `<span class="assignment-highlight" style="background-color: ${this.color};">$1</span>`);
        titleContent.style.textDecoration = this.completed ? "line-through" : "none";
        titleContent.className = "title";

        let dueSplit = this.dueDate.split("-");
        let dueTimeSplit = this.dueTime.split(":");
        let check = parseInt(dueTimeSplit[0]) > 12 ? true : false;

        var dueContent = document.createElement("span");
        dueContent.textContent = `Due ${dueSplit[1]}/${dueSplit[2]}/${dueSplit[0]}, ${check ? parseInt(dueTimeSplit[0]) - 12 : dueTimeSplit[0]}:${dueTimeSplit[1]} ${check ? "PM" : "AM"}`;
        titleContent.appendChild(dueContent);

        var buttonDiv = document.createElement("div");

        var expandButton = document.createElement("button");
        expandButton.className = "button-svg";
        buttonDiv.appendChild(expandButton);

        var expandIcon = document.createElement("img");
        expandIcon.src = "img/expand.svg";
        expandButton.appendChild(expandIcon);

        var deleteButton = document.createElement("button");
        deleteButton.className = "button-svg";
        buttonDiv.appendChild(deleteButton);

        var deleteIcon = document.createElement("img");
        deleteIcon.src = "img/delete.svg";
        deleteButton.appendChild(deleteIcon);

        var deleteConfirm = false;

        headDiv.appendChild(titleContent);
        headDiv.appendChild(buttonDiv);

        // Body Div
        var bodyDiv = document.createElement("div");
        bodyDiv.className = "assignment-body";

        var descContent = document.createElement("p");
        descContent.innerText = this.desc;

        var editButton = document.createElement("button");
        editButton.innerText = "Copy";
        descContent.appendChild(editButton);

        bodyDiv.appendChild(descContent);

        // Append Children
        mainDiv.appendChild(headDiv);
        mainDiv.appendChild(bodyDiv);

        // Button Listeners
        titleContent.addEventListener("click", function() {
            // We are moving the div; remove it from its parent element
            mainDiv.parentElement.removeChild(mainDiv);

            if (this.completed) {
                titleContent.style.textDecoration = "none";
                this.completed = false;

                // Check which section to store it in
                if (this.checkIfDueSoon()) {
                    dueStorage.appendChild(mainDiv);
                } else {
                    upcomingStorage.appendChild(mainDiv);
                }
            } else {
                titleContent.style.textDecoration = "line-through";
                completedStorage.appendChild(mainDiv);
                this.completed = true;
            }

            saveAssignments();
        }.bind(this));

        expandButton.addEventListener("click", function() {
            if (bodyDiv.style.display == "none" || bodyDiv.style.display == "") {
                //Hide other descriptions
                var divs = document.getElementsByClassName("assignment-body");
                for (let div of divs) {
                    if (div != bodyDiv) {
                        div.style.display = "none";
                        
                        var head = div.parentElement.querySelector(".assignment-head");
                        head.style.borderRadius = "6px";
                        var img = head.querySelector("img");

                        if (img) {
                            img.style.transform = "rotate(0deg)";
                        }
                    }
                }

                bodyDiv.style.display = "block";
                headDiv.style.borderRadius = "6px 6px 0 0";
                expandIcon.style.transform = "rotate(180deg)";
            } else {
                bodyDiv.style.display = "none";
                headDiv.style.borderRadius = "6px";
                expandIcon.style.transform = "rotate(0deg)";
            }
        });

        deleteButton.addEventListener("click", function() {
            if (!deleteConfirm) {
                deleteConfirm = true;
                deleteIcon.src = "img/delete-red.svg";
                setTimeout(function() {
                    deleteConfirm = false;
                    deleteIcon.src = "img/delete.svg";
                }, 5000);
            } else {
                mainDiv.parentElement.removeChild(mainDiv);
                assignments.splice(assignments.indexOf(this), 1);
                delete this;
                saveAssignments();
            }
        }.bind(this));

        editButton.addEventListener("click", function() {
            openNew();
            itemTitle.value = this.title;
            itemDesc.value = this.desc;
            itemDate.value = this.dueDate;
            itemTime.value = this.dueTime;
            colorHolder.style.backgroundColor = this.color;

            
        }.bind(this));

        return mainDiv;
    }
}

/* 
=====================
    MAIN FUNCTIONS
=====================
*/

function tipCheck() {
    tipText.style.display = assignments.length == 0 ? "block" : "none";
    arrow.style.display = assignments.length == 0 ? "block" : "none";
}

function stripHTML(html) {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

function updateContainers() {
    upcomingHeading.style.display = upcomingStorage.hasChildNodes() ? "block" : "none";
    dueHeading.style.display = dueStorage.hasChildNodes() ? "block" : "none";
    completedHeading.style.display = completedStorage.hasChildNodes() ? "block" : "none";

    upcomingHeading.innerText = `UPCOMING (${upcomingStorage.childNodes.length}):`;
    dueHeading.innerText = `DUE (${dueStorage.childNodes.length}):`;
    
    tipCheck();
}

function sendNotification(arr) {
    // Cancel if arr == 0
    if (arr.length == 0) return;

    // Assemble body content
    var body = arr.length == 1 ? `Assignment '${arr[0].title}' is due at ${arr[0].dueTime}.` : `${arr.length} new assignments are due soon.`;

    // Send Notification
    new window.Notification("Assignments Due Soon", { 
        body: body,
        icon: "../icon.ico"
    });
}

function refreshDisplay() {
    var notifArr = [];

    for (var assignment of assignments) {
        if (assignment.completed) continue;
        let moved = assignment.display(); // Refresh assignment display

        // If it moves, add to notification array
        if (moved) notifArr.push(assignment);
    }

    sendNotification(notifArr);
}

function readSavedAssignments() {
    var items = JSON.parse(window.localStorage.getItem("assignments"));
    for (var x of items) {
        var assignment = new Assignment(
            x.title,
            x.desc,
            x.dueDate,
            x.dueTime,
            x.color,
            x.completed
        );

        assignments.push(assignment);
        assignment.display();
    }
}

function saveAssignments() {
    assignments.sort((a, b) => a.compareTo(b));
    window.localStorage.setItem("assignments", JSON.stringify(assignments));
    refreshDisplay();
    updateContainers();
}

function getDate() {
    var today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
}

function getTime() {
    var time = new Date();
    return `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
}

function getRawDate(date, time) {
    var dateSplit = date.split("-");
    var timeSplit = time.split(":");

    var date = new Date();
    date.setMonth(parseInt(dateSplit[1]) - 1, parseInt(dateSplit[2]));
    date.setFullYear(parseInt(dateSplit[0]));
    
    date.setHours(parseInt(timeSplit[0]));
    date.setMinutes(parseInt(timeSplit[1]));

    return date;
}

/* 
=====================
    BUTTON EVENTS
=====================
*/

function openNew() {
    // Animate and style items
    newItemUI.style.transform = "none";
    blackScreen.style.display = "block";
    document.body.style.overflowY = "hidden";

    // Set default input values
    itemTitle.value = "";
    itemDesc.value = "";
    itemDate.value = getDate();
    itemTime.value = "23:59";
    colorHolder.style.backgroundColor = "#1e90ff";

    // Focus
    itemTitle.focus();
}

function close() {
    newItemUI.style.transform = "translate(110%)";
    blackScreen.style.display = "none";
    itemTitle.style.border = "1px solid white";
    document.body.style.overflow = "auto";
    colorGrid.style.display = "none";
}

function resizeWindow() {
    if (window.outerWidth < screen.width) {
        window.resizeTo(screen.width, screen.height);
    } else {
        window.resizeTo(600, 400);
    }
}

function saveNew() {
    // Do not allow a new saved item with no title
    if (itemTitle.value.trim() == "") {
        newItemUI.style.animation = "shake 0.17s 2 linear";
        itemTitle.style.border = "1px solid red";
        return;
    }

    // Close the UI
    close();

    // Create new assignment and push
    var newAssignment = new Assignment(
        itemTitle.value,
        itemDesc.value != "" ? itemDesc.value : "No description available.",
        itemDate.value,
        itemTime.value,
        colorHolder.style.backgroundColor,
        false
    );
    
    assignments.push(newAssignment);
    newAssignment.display();

    saveAssignments();
}

function colorPick() {
    colorGrid.style.display = colorGrid.style.display == "flex" ? "none" : "flex";
}

function updateColor(item) {
    colorGrid.style.display = "none !important";
    colorHolder.style.backgroundColor = item.target.style.backgroundColor;
}

function clearCompleted() {
    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].completed) {
            var index = assignments.indexOf(assignments[i]);
            assignments.splice(index, 1);
            i--;
        }
    }
    
    saveAssignments();
    window.location.reload(true);
}

function textFormatting(event) {
    if (event.code == "Enter") {
        // Obtain the line position
        let caretPos = itemDesc.selectionStart;
        let textUptoCaret = itemDesc.value.substring(0, caretPos);
        let line = textUptoCaret.split("\n").length;
        var split = itemDesc.value.split("\n")

        // Check if previous line begins with bullet
        if (split[line - 2].startsWith("•") && split[line - 2].trim() != "•") {
            // Append new bullet
            split[line - 1] += "• ";
            itemDesc.value = split.join("\n");


            let caret = 0;
            for (let i = 0; i < line; i++) {
                caret += split[i].length + 1; // +1 for the "\n"
            }
        
            // Set caret position
            itemDesc.setSelectionRange(caret - 1, caret - 1);;
        }
    }
    

    // Check for CTRL + Shift + * (for bullet point)
    if (event.shiftKey && event.ctrlKey) {
        if (event.key == "*") {
            itemDesc.value += "• ";
        }
    }
}

/* 
=====================
       LOADER
=====================
*/

// Create save if it does not exist
if (window.localStorage.getItem("assignments") == null) {
    window.localStorage.setItem("assignments", JSON.stringify([]));
}

readSavedAssignments();
updateContainers();

/* 
=====================
    DUE LISTENER
=====================
*/

setInterval(refreshDisplay, refreshTime * 1000);

/* 
=====================
   BUTTON LISTENERS
=====================
*/

itemDesc.addEventListener("keyup", textFormatting);
blackScreen.addEventListener("click", close);
newItemButton.addEventListener("click", openNew);
createButton.addEventListener("click", saveNew);
colorHolder.addEventListener("click", colorPick);
colorGrid.addEventListener("click", updateColor);
clearAll.addEventListener("click", clearCompleted);
resizeButton.addEventListener("click", window.electronAPI.resizeWindow);
minimizeButton.addEventListener("click", window.electronAPI.minimizeWindow);
closeButton.addEventListener("click", window.electronAPI.closeWindow);
newItemUI.addEventListener("animationend", () => newItemUI.style.animation = "none");