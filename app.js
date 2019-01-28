/**
 *  Budget controller
 */
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };


  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  Expense.prototype.calcPercentage = function (totalIncomes) {
    if (totalIncomes > 0){
      this.percentage = Math.round((this.value / totalIncomes) * 100)
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (item) {
      sum += item.value;
    })
    data.totals[type] = sum;
  };


  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    purcentage: -1,
  };


  return {

    addItem: function (type, des, val) {
      var newItem, ID;

      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0
      }

      // create new element
      if (type === 'exp') {
        newItem = new Expense(ID, des, val)
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val)
      }

      // push into data structure
      data.allItems[type].push(newItem);
      // Retrun new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var itemIds, index;
      itemIds = data.allItems[type].map(function (item) {
        return item.id;
      });
      index = itemIds.indexOf(id)

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudjet: function () {
      // Calculate total incomes and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // Calculate the budget  = incomes - expenses
      data.budget = data.totals.inc - data.totals.exp
      // Calculate the % of income the we spent
      if (data.totals.inc > 0) {
        data.purcentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function (item) {
        item.calcPercentage(data.totals.inc)
      });
    },
    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (item) {
        return item.getPercentage()
      });
      return allPerc
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        purcentage: data.purcentage,
      }
    },
    // testing data TO REMOVE
    testing: function () {
      console.log(data);
    }
  };

})();


/**
 *  UI  controller
 */
var UIController = (function () {
  var DOMStrings = {
    typeString: '.add__type',
    descString: '.add__description',
    valString: '.add__value',
    addBuntton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomesLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensePercLabel: '.item__percentage'
  };
  var  formatNumber = function(num, type) {
    var numSplit, int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];
    if(int.length > 3) {
      int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3 ,int.length);
    }
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +dec;
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.typeString).value, /// will be either inc + exp
        desc: document.querySelector(DOMStrings.descString).value,
        val: parseFloat(document.querySelector(DOMStrings.valString).value),
      }
    },
    addListItem: function (obj, type) {
      // create html with placeholder
      var element, newHTML;
      if (type === 'inc') {
        element = DOMStrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-${obj.id}">
                <div class="item__description">${obj.description}</div>
                  <div class="right clearfix">
                    <div class="item__value">${formatNumber(obj.value, type)}</div>
                    <div class="item__delete">
                      <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                  </div>
              </div>`
      } else if (type === 'exp') {
        element = DOMStrings.expenseContainer;
        // replace place holder
        html = `<div class="item clearfix" id="exp-${obj.id}">
              <div class="item__description">${obj.description}</div>
              <div class="right clearfix">
                <div class="item__value">${formatNumber(obj.value, type)}</div>
                <div class="item__percentage">21%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
              </div>
            </div>`
      }
      // add to dom
      newHTML = html;
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
    },
    deleteListItem: function(selectorId) {
      var el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },
    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMStrings.descString + ', ' + DOMStrings.valString)
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (item, index, array) {
        item.value = '';
      })
      fieldsArr[0].focus()
    },
    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomesLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if (obj.purcentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.purcentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';

      }

    },
    displayPercentages: function(percentages) {
      var fiels = document.querySelectorAll(DOMStrings.expensePercLabel);
      // reusable Code with CallBack loop for
      var nodeListForEach = function (list, cb) {
        for (var i = 0; i < list.length; i++) {
          cb(list[i], i);
        }
      };
      nodeListForEach(fiels,function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      })

    },
    getDOMString: function () {
      return DOMStrings
    }
  }

})();

/**
 * @param  {function} budgetCtrl
 * @param  {function} UIctrl
 */

var controller = (function (budgetCtrl, UIctrl) {
  var setupEventListeners = function () {
    var DOM = UIController.getDOMString();
    document.querySelector(DOM.addBuntton).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function (e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
        // same as the actions of the button
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDelItem)
  };


  var updateBudjet = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudjet();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display thr budget on the UI
    UIController.displayBudget(budget)
  };
  var updatePercentages = function () {
    // 1. Calculate the percentages
    budgetController.calculatePercentages();
    // 2. Read percentages from the bidget controller
    var percentages = budgetController.getPercentages();
    //  Update the UI with percentages
    UIController.displayPercentages(percentages);
  };
  var ctrlAddItem = function () {
    var input, newItem;
    // 1. Get fields input data
    input = UIctrl.getInput();
    if (input.desc !== '' &&
      !isNaN(input.val) &&
      input.val > 0) {
      // 2. Add the item to the budet controller
      newItem = budgetController.addItem(input.type, input.desc, input.val);
      // 3. Add the item to the UI
      UIController.addListItem(newItem, input.type);
      // 4. Clear Fields
      UIController.clearFields();
      // 5. Calculate abd update data
      updateBudjet();
      // 6. Update percentages
      updatePercentages();
    }
  };
  var ctrlDelItem = function (event) {
    var itemID, splitID, type, id;
    itemID = event.target.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);
      // 1. Delete item from the data structure
      budgetController.deleteItem(type, id);
      //2. Delete item from the UI
      UIController.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudjet();
      // 4. Update percentages
      updatePercentages();
    }
  };
  return {
    init: function () {
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        purcentage: -1,
      });
      setupEventListeners();
    },
  };

})(budgetController, UIController);
controller.init();
