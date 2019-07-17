class TextFieldCtrl {
    constructor(Utils) {
        this.utils = Utils
        this.hasError = false

        this.onUpdate = this.onUpdate.bind(this)
    }

    $onInit() {
        const self = this
        this.ctrl.$render = () => {
            self.value = self.ctrl.$viewValue;
        }
        if (this.initRequire && (this.data === '' || this.data === null || this.data === undefined)) {
            this.hasError = true
        }
    }


    // Pass back Changes -----------------------------------
    onUpdate(item) {
        this.ctrl.$setViewValue(this.value)

        if (this.inputRequired && (item === '' || item === null || item === undefined)) {
            this.ctrl.$setValidity("required", false)
            this.hasError = true
        } else if (this.inputRequired && (item !== '' || item !== null || item !== undefined)) {
            this.ctrl.$setValidity("required", true)
            this.hasError = false
        }

        this.onDataChange({
            changedData: item,
            selected:    this.modelName
        });
    }

    // -----------------------------------------------------
}

angular.module('CommonComponents')
       .component('textField', {
           templateUrl: '/lib/public/angular/views/component.views/customComponents/textfield.html',
           bindings:    {
               labelText:       '@',
               modelName:       '@',
               inputStyling:    '@',
               fieldStyling:    '@',
               placeholderText: '@',
               onDataChange:    '&',
               data:            '<',
               disabled:        '<',
               initRequire:     '<',
               inputRequired:   '<'
           },
           require:     {ctrl: 'ngModel'},
           controller:  ['Utils', TextFieldCtrl]
       })

