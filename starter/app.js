// For control money income and spend
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

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      // Create new ID
      if (data.allItems[type] > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Create new Item
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // Push it in array
      data.allItems[type].push(newItem);

      // Return new element
      return newItem;
    },

    calculateBudget: function () {
      // Calaculate total income and expense
      calculateTotal('inc');
      calculateTotal('exp');

      // Calculate the budget : income - expense
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we have spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

    },
    getBudget: function (obj) {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    }
  }

})();


// For adding and removing things in UI
var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLable: '.budget__value',
    incomeLable: '.budget__income--value',
    expenseLable: '.budget__expenses--value',
    percentageLable: '.budget__expenses--percentage'
  }
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;
      // Create HTML string with  placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMstrings.expenseContainer;
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">description</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      // Insert the HTML into theee DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    clearFields: function () {
      var fields, fieldArr;

      fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

      fieldArr = Array.prototype.slice.call(fields);

      fieldArr.forEach(function (current, index, array) {
        current.value = '';
      });

      fieldArr[0].focus();
    },

    displayBudget: function (obj) {
      document.querySelector(DOMstrings.budgetLable).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLable).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expenseLable).textContent = obj.totalExp;
      document.querySelector(DOMstrings.percentageLable).textContent = obj.percentage;
    },

    getDOMstrings: function () {
      return DOMstrings;
    }
  };

})();


// Global APP Controller 
var controller = (function (budgetCtrl, UICtrl) {

  var setupEventListener = function () {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
  };

  var updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  };

  var ctrlAddItem = function () {
    var input, newItem;

    // 1. Get input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value)

      // 3. Add item to UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear Fields
      UICtrl.clearFields();

      // 5. Calculate and Update Budget

    }
  };

  return {
    init: function () {
      setupEventListener();
    }
  }

})(budgetController, UIController);


controller.init();