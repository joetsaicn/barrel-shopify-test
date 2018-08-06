export default {
  methods: {
    validate (e) {
      const isValid = this.$children
        .filter(c => (typeof c.validate !== 'undefined'))
        .map(c => c.validate())
        .every(res => res)

      if (!isValid) {
        e.preventDefault()
      }
    }
  }
}
