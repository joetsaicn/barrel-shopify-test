import select from 'dom-select'

class Init {
  constructor () {
    this.nodes = []

    this.init = this.init.bind(this)
    this.reset = this.reset.bind(this)
  }

  init () {
    this.modules = this.fetchModules()
    for (let i = 0; i < this.modules.length; i++) {
      if (
        this.modules[i].fn &&
        this.modules[i].fn.init
      ) {
        this.modules[i].fn.init(this.modules[i].el)
      } else if (typeof this.modules[i].fn.bind !== 'undefined') {
        this.modules[i].fn(this.modules[i].el)
      }
    }
  }

  reset () {
    for (let i = 0; i < this.modules.length; i++) {
      this.modules[i].fn &&
      this.modules[i].fn.destroy &&
      this.modules[i].fn.destroy()
    }

    this.modules = []
  }

  fetchModules () {
    const nodes = select.all('[data-module], [is]')
    const modules = []
    for (let i = 0; i < nodes.length; i++) {
      const type = !!nodes[i].getAttribute('data-module')
        ? 'module'
        : 'vue'

      const name = type === 'module'
        ? nodes[i].getAttribute('data-module')
        : nodes[i].getAttribute('is').replace('vue-', '')

      const fn = type === 'module'
        ? require(`root/modules/${name}/${name}.js`)
        : require(`root/modules/${name}/${name}.vue.js`)

      modules.push({
        fn: fn.default || fn,
        el: nodes[i]
      })
    }
    return modules
  }
}

export default new Init()
