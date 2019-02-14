/* global Image */
import Vue from 'vue'
import { supportsObjectFit } from 'lib/util'

Vue.component('vue-image', {
  props: [
    'src',
    'zoomsrc',
    'srcset',
    'alt',
    'css',
    'fit',
    'pos'
  ],
  data: function () {
    return {
      mainImageSrc: '',
      secondaryImgSrc: '',
      objectFitOk: supportsObjectFit(),
      states: {
        isLoaded: false
      }
    }
  },
  mounted () {
    this.prepareNewImage()
  },
  computed: {
    imgLoaded () {
      return this.states.isLoaded ? 'is-loaded' : ''
    },
    imgFit () {
      return (this.fit) ? `fit-${this.fit}` : 'fit-cover'
    },
    imgPos () {
      return (this.pos) ? `pos-${this.pos}` : 'pos-center'
    },
    backgroundImage () {
      const sources =
      (this.srcset || this.src)
        .split(/\s?,\s?/)
        .reduce((o, val) => {
          let brk = val.split(/\s|w$/)
          o[brk[1] || 0] = brk[0]
          return o
        }, {})

      return sources[Math.max(...Object.keys(sources))]
    }
  },
  methods: {
    prepareNewImage () {
      const img = new Image()
      img.onload = () => {
        this.states.isLoaded = true
      }
      img.src = this.src
    }
  },
  template: `
    <div class="img" :class="[css, imgFit, imgLoaded, imgPos]">
      <transition name="fade" mode="in-out">
        <img
          v-if="objectFitOk"
          class="img__el"
          :src="src"
          :srcset="srcset"
          :alt="alt"
          :title="alt"
          :data-fit="fit"
          :data-zoom="zoomsrc"
          :key="src" />
        <div
          v-else
          class="img__el"
          :title="alt"
          :data-fit="fit"
          :data-zoom="zoomsrc"
          :style="{backgroundImage: 'url(' + backgroundImage + ')'}"></div>
      </transition>
    </div>
  `
})
