import Vue from 'vue'

Vue.component('submit-button', {
  props: [
    'value',
    'name',
    'disabled',
    'loading',
    'loader'
  ],
  computed: {
    wrapperClass: function () {
      return `submit-button${(this.$props.loading ? ' is-loading' : '')}`
    }
  },
  methods: {
    disableIfLoading: function (e) {
      if (this.loading) {
        e.preventDefault()
        e.stopPropagation()
      } else {
        this.$emit('click', e)
        return true
      }
    }
  },
  template: `
  <button :class="wrapperClass" :value="value" :name="name" v-on:click="disableIfLoading" :disabled="disabled">
    <img v-if="loading" class="submit-button__loader" :src="loader" />
    <span v-if="!loading">{{value}}</span>
  </button>
  `
})
