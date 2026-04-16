<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  placeholder: {
    type: String,
    default: '0,00'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const displayValue = computed({
  get: () => {
    // Retorna formatado em R$, mas só o número. Ex: "1.234,56"
    return (props.modelValue || 0).toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  },
  set: (val: string) => {
    // Remove tudo que não for dígito
    const onlyDigits = val.replace(/\D/g, '')
    if (!onlyDigits) {
      emit('update:modelValue', 0)
      return
    }
    
    // Converte os últimos 2 dígitos finais para centavos
    const rawNumber = parseInt(onlyDigits, 10) / 100
    emit('update:modelValue', rawNumber)
  }
})

const handleFocus = (e: FocusEvent) => {
  const target = e.target as HTMLInputElement
  target.select()
}
</script>

<template>
  <input
    v-model="displayValue"
    type="text"
    inputmode="numeric"
    :placeholder="placeholder"
    :readonly="readonly"
    @focus="handleFocus"
  />
</template>
