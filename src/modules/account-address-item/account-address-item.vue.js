/* global confirm */
import Vue from 'vue'
import {
  deepClone
} from 'lib/util'

Vue.component('account-address-item', {
  props: [
    'firstName',
    'lastName',
    'company',
    'address1',
    'address2',
    'city',
    'province',
    'zip',
    'country',
    'phone',
    'isDefault',
    'id'
  ],
  data () {
    return {}
  },
  computed: {
  },
  methods: {
    update () {
      this.$emit('update', deepClone(this.$options.propsData))
    },
    remove () {
      if (
        !confirm('Are you sure that you want to delete this address?')
      ) return

      const form = document.createElement('form')
      const input = document.createElement('input')

      form.setAttribute('method', 'post')
      form.setAttribute('action', '/account/addresses/' + this.id)

      input.setAttribute('type', 'hidden')
      input.setAttribute('name', '_method')
      input.setAttribute('value', 'delete')

      form.appendChild(input)

      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    }
  }
})
