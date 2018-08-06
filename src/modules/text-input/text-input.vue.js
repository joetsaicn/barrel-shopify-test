import Vue from 'vue'

Vue.component('text-input', {
  props: [
    'name',
    'label',
    'type',
    'modifier',
    'initialValueGetter',
    'autocorrect',
    'autocapitalize',
    'placeholder',
    'error',
    'required',
    'validateMethod'
  ],
  data () {
    const data = {
      isValid: true,
      isActive: false,
      showErrorMessage: false
    }

    if (this.initialValueGetter && this.initialValueGetter.bind !== 'undefined') {
      data['inputValue'] = this.initialValueGetter(this.name)
    } else {
      data['inputValue'] = ''
    }

    return data
  },
  watch: {
    inputValue () {
      this.$emit('change', {
        value: this.inputValue,
        name: this.name
      })
    }
  },
  mounted () {
    this.$emit('change', {
      value: this.inputValue,
      name: this.name
    })
    if (this.inputValue) this.setActive()
  },
  methods: {
    validate () {
      if (this.validateMethod) {
        this.isValid = this.validateMethod({
          value: this.inputValue,
          name: this.name
        })
      } else if (this.required && !this.inputValue) {
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
    },
    refresh () {
      setTimeout(() => {
        this.inputValue = this.$refs.input.value
        if (this.inputValue) this.setActive()
      }, 0)
    }
  },
  template: `
  <div :class="{'has-errors': !isValid}">
    <div class="text-input__wrap">
      <label v-if="label || modifier === 'default'" :class="('text-input__label p' + (isActive ? ' is-active' : ''))">
        {{(label ? label : placeholder)}}
      </label>
      <input
        ref="input"
        class="text-input__el p"
        :type="type"
        :name="name"
        :autocorrect="autocorrect"
        :autocapitalize="autocapitalize"
        v-model="inputValue"
        v-on:focus="setActive"
        v-on:blur="unsetActive" />
    </div>
    <transition name="fade">
      <p v-if="!isValid" class="text-input__error red">{{error}}</p>
    </transition>
  </div>`
})
