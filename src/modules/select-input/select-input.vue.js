import Vue from 'vue'

Vue.component('select-input', {
  props: [
    'name',
    'label',
    'getValue',
    'value',
    'error',
    'validator',
    'required',
    'options'
  ],
  data: function () {
    const data = {
      inputValue: '',
      inputOptions: [],
      isValid: true,
      isActive: false,
      showErrorMessage: false
    }

    if (this.options && this.options.bind !== 'undefined') {
      data['inputOptions'] = this.options().map(opt => {
        if (typeof opt !== 'undefined' && typeof opt.value === 'undefined') {
          return {
            value: opt,
            label: opt
          }
        }
        return opt
      })
    }
    if (
      this.getValue &&
      this.getValue.bind !== 'undefined' &&
      '' + this.getValue(this.name)
    ) {
      data['inputValue'] = this.getValue(this.name)
    } else if (data['inputOptions'].length) {
      data['inputValue'] = data['inputOptions'][0].value
    }
    return data
  },
  watch: {
    inputValue: function () {
      this.$emit('change', {
        value: this.inputValue,
        name: this.name
      })
    }
  },
  mounted: function () {
    this.$emit('change', {
      value: this.inputValue,
      name: this.name
    })
  },
  methods: {
    validate () {
      if (this.validator) {
        this.isValid = this.validator(this.inputValue)
      } else if (this.required && !('' + this.inputValue)) {
        this.isValid = false
      } else {
        this.isValid = true
      }
      return this.isValid
    },
    setActive () {
      this.isActive = true
    },
    unsetActive () {
      if (!this.inputValue) this.isActive = false
    }
  },
  computed: {},
  template: `
  <div>
    <div class="select-input__wrap">
      <label v-if="label" class="select-input__label p2">
        {{label}}
      </label>
      <div class="select-input__el-wrap">
        <select :name="name" class="select-input__el p2" v-model="inputValue">
          <template v-if="inputOptions.length">
            <option
              v-for="(option, index) in inputOptions"
              :value="option.value"
              :selected="(inputValue === option.value)">
              {{option.label}}
            </option>
          </template>
        </select>
        <i class="select-input__icon"></i>
      </div>
    </div>
    <transition name="error-fade">
      <p v-if="!isValid" class="text-input__error red">{{error}}</p>
    </transition>
  </div>`
})
