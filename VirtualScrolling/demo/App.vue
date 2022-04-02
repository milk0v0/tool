<template>
	<div id="app">
		<VirtualScrolling :dataSource="dataSource" :getHeight="21">
			<template v-slot="{ data }">
				{{ data }}
			</template>
		</VirtualScrolling>
	</div>
</template>

<script>
	import city_data from "./city.json";
	import VirtualScrolling from "@/components/VirtualScrolling";
	export default {
		components: {
			VirtualScrolling,
		},
		data() {
			return {
				dataSource: city_data,
			};
		},
	};
</script>

<style lang="scss">
	#app {
		width: 500px;
		height: 500px;
	}
</style>