/* global Countries */
import Vue from 'vue'
import select from 'dom-select'

Vue.component('account-new-address', {
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
    'id',
    'toggleNewAddressForm'
  ],
  data () {
    return {
      'activeCountry': this.getCountryFromCode(this.country)
    }
  },
  computed: {
    showProvinceSelect () {
      return (
        this.activeCountry &&
        Countries[this.activeCountry] &&
        (Countries[this.activeCountry].provinces || []).length
      )
    },
    formAction () {
      if (this.id) {
        return `/account/addresses/${this.id}`
      } else {
        return '/account/addresses'
      }
    }
  },
  methods: {
    getInitialValue (name) {
      const match = name.match(/\[(.*)\]/)
      if (!match[1]) {
        return ''
      }
      const str = match[1]

      switch (str) {
        case 'first_name':
          return this['firstName'] || ''
        case 'last_name':
          return this['lastName'] || ''
        case 'default':
          return this['isDefault'] || false
        default:
          return this[str] || ''
      }
    },
    getCountryFromCode (value) {
      return Object.keys(Countries).find(k => (
        Countries[k]['code'] === value
      ))
    },
    onInputChange ({ name, value }) {
      const match = /\D\[(\D+)\]/.exec(name)
      if (!match || !match[1]) {
        return false
      }
      if (match[1] === 'country' && value) {
        this.activeCountry = this.getCountryFromCode(value)

        const country = Countries[this.activeCountry]
        this['zip_required'] = country['zip_required']
      }
    },
    generateCountryArray () {
      return Object.keys(Countries).map(label => ({
        label,
        value: Countries[label].code
      }))
    },
    generateProvinceArray () {
      if (!this.showProvinceSelect) {
        return []
      }
      const opts = Countries[this.activeCountry]['province_codes']
      return Object.keys(opts).map(label => ({
        label,
        value: opts[label]
      }))
    },
    isValidZip ({ value }) {
      if (this['zip_required'] && !value.length) {
        return false
      }

      return true
    },
    submit (e) {
      e.preventDefault()

      this.isValid = this.$children
        .filter(c => (typeof c.validate !== 'undefined'))
        .map(c => c.validate())
        .every(res => res)

      if (!this.isValid) {
        return
      }

      select('form', this.$refs['wrapper']).submit()
    }
  }
})
