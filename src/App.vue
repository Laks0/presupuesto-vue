<template>
	<router-view v-slot="{ Component }">
		<transition name="slide-fade">
			<component :is="Component" :key="$router.path" />
		</transition>
	</router-view>
</template>

<script>
import "./BootstrapUrban.css";
export default {
	name: "App",
}
</script>

<style>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
