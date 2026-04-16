<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
    <router-view />
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import BackToTop from './components/BackToTop.vue'
</script>
