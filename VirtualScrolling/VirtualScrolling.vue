<template>
	<div class="wrapper" ref="wrapper" @scroll="handleScroll">
		<div class="background" :style="{ height: totalHeight + 'px' }"></div>
		<div
			:style="{
				'-webkit-transform': 'translate3d(0, ' + transformY + 'px, 0)',
			}"
		>
			<div v-for="(item, index) in runList" :key="index">
				<slot :data="item.data"></slot>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			// 数据源
			dataSource: {
				type: Array,
				default: () => [],
			},
			// 缓冲的屏幕数量
			cacheScreens: {
				type: Number,
				default: 1,
			},
			// 每条高度
			getHeight: {
				type: Number | Function,
				default: 32,
			},
		},

		data() {
			return {
				ticking: false, // 节流使用
				dataList: [], // 全部数据 - 处理过的
				runList: [], // 运行时列表
				totalHeight: 0, // 列表总高度
				minHeight: 0, // 最小高度
				scrollScale: [], // 不执行滚动范围
				maxNum: 0, // 一屏的最大数量
				transformY: 0,
			};
		},

		watch: {
			dataSource: {
				handler() {
					this.$nextTick(() => {
						this.init();
						this.getRunData();
					});
				},
				immediate: true,
			},
		},

		methods: {
			init() {
				this.totalHeight = 0;
				this.transformY = 0;
				this.minHeight =
					typeof this.getHeight === "number"
						? this.getHeight
						: this.getHeight({ ...this.dataSource[0] });

				this.dataList = this.dataSource.map((data, index) => {
					const height =
						typeof this.getHeight === "number"
							? this.getHeight
							: this.getHeight({ ...data });

					this.minHeight < height && (this.minHeight = height);

					const obj = {
						index,
						height,
						top: this.totalHeight,
						data,
					};

					this.totalHeight += height;

					return obj;
				});

				// 一屏的最大数量
				const containerHeight = parseInt(
					getComputedStyle(this.$refs.wrapper).height
				);
				this.maxNum = Math.ceil(containerHeight / this.minHeight);
			},

			//二分法计算起始索引
			getStartIndex(scrollTop) {
				let start = 0;
				let end = this.dataList.length - 1;
				while (start < end) {
					const mid = Math.floor((start + end) / 2);
					const { top, height } = this.dataList[mid];
					if (scrollTop >= top && scrollTop < top + height) {
						start = mid;
						break;
					} else if (scrollTop >= top + height) {
						start = mid + 1;
					} else if (scrollTop < top) {
						end = mid - 1;
					}
				}

				return start;
			},

			getRunData(distance = 0) {
				//在哪个范围内不执行滚动
				if (distance > this.scrollScale[0] && distance < this.scrollScale[1]) {
					return;
				}

				//起始索引
				let start_index = this.getStartIndex(distance);
				start_index = start_index < 0 ? 0 : start_index;

				//上屏索引
				let upper_start_index = start_index - this.maxNum * this.cacheScreens;
				upper_start_index = upper_start_index < 0 ? 0 : upper_start_index;

				// 调整offset
				this.transformY = this.dataList[upper_start_index].top;

				//中间屏幕的元素
				const mid_list = this.dataList.slice(
					start_index,
					start_index + this.maxNum
				);

				// 上屏
				const upper_list = this.dataList.slice(upper_start_index, start_index);

				// 下屏元素
				let down_start_index = start_index + this.maxNum;

				down_start_index =
					down_start_index > this.dataList.length - 1
						? this.dataList.length
						: down_start_index;

				this.scrollScale = [
					this.dataList[Math.floor(upper_start_index + this.maxNum / 2)].top,
					this.dataList[Math.ceil(start_index + this.maxNum / 2)]?.top ||
						this.dataList[this.dataList.length - 1].top,
				];

				const down_list = this.dataList.slice(
					down_start_index,
					down_start_index + this.maxNum * this.cacheScreens
				);

				this.runList = [...upper_list, ...mid_list, ...down_list];
			},

			handleScroll(e) {
				// 节流操作
				if (this.ticking) {
					return;
				}
				this.ticking = true;
				requestAnimationFrame(() => {
					this.ticking = false;
				});

				this.getRunData(e.target.scrollTop);
			},
		},
	};
</script>

<style lang="scss" scoped>
	.wrapper {
		width: 100%;
		height: 100%;
		position: relative;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;

		.background {
			width: 100%;
			position: absolute;
			z-index: -1;
		}
	}
</style>