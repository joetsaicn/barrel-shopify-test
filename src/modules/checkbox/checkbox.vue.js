import Vue from 'vue'

Vue.component('checkbox', {
  props: [
    'checked',
    'value',
    'name',
    'required'
  ],
  data () {
    return {
      isValid: true,
      isChecked: !!this.checked,
      publicValue: this.value || true
    }
  },
  methods: {
    validate () {
      this.isValid = (
        !this.required ||
        (this.required && this.isChecked)
      )
      return this.isValid
    },
    onChange () {
      this.isChecked = !this.isChecked
      let value = this.isChecked ? this.publicValue : false
      this.$emit('change', { name: this.name, value })
    }
  },
  template: `
  <div class="checkbox__icon" :class="{'is-active': isChecked, 'is-error': !isValid}">
    <input
      class="checkbox__icon-el"
      type="checkbox"
      :name="name"
      :value="value"
      :checked="isChecked"
      v-on:change="onChange" />
      <svg class="checkbox__icon-tick" viewBox="0 0 13 9">
        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-checkmark" x="0" y="0"></use>
      </svg>
  </div>
  `
})
