<template>
	<div id="app">
		<VirtualScrolling v-model="num" :dataSource="dataSource" :getHeight="21">
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
        num: 0,
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