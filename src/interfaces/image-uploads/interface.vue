<template>
	<div :class="{ invalid }">
		<div class="v-input">
			<div class="input disabled">
				<input :value="value" disabled id="Name" type="input" @input="handleChange($event)"  placeholder="Uploading successfully, the photo URL is show here!"/>
			</div>
		</div>

		<div
			data-dropzone
			class="v-upload"
			:class="{ uploading }"
		>
			<template v-if="uploading">
				<p class="type-text">
					{{t('upload_file_indeterminate')}}
				</p>
			</template>

			<template v-else>
				<div class="actions">
					<input ref="file" class="browse" type="file" @input="onBrowseSelect" accept="image/*"/>
					<v-icon name="file_upload" />
				</div>

				<p class="type-label">Select image to upload</p>
			</template>
		</div>

		<template v-if="invalid">
			<small class="validation-error">
				This file is too large to be uploaded. Files larger than 1MB are not currently supported
			</small>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import fetch from 'node-fetch';

const URI = '/s3/upload-photo';
const fileSize = 1000000;

export default defineComponent({
	props: {
		value: {
			type: String,
			default: null,
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		function useUpload() {
			let uploading = ref(false);
			let invalid = ref(false);

			async function upload(files: FileList) {
				uploading.value = true;
				invalid.value = false;

				let file = files[0]

				if(file.size > fileSize) {
					invalid.value = true;
					uploading.value = false;
				} else {
					try {
						let formdata = new FormData();
						formdata.append("file", file);

						let requestOptions:any = {
							method: 'post',
							body: formdata
						};

						let photoUrl = await fetch(window.location.origin + URI, requestOptions)
							.then(response => response.json())
							.then(result => {
								console.log('Result upload-images API:', result);
								console.log('result.data.url:', result.data.url);
								return result.data.url;
							})
						.catch(error => {
							throw new Error(error);
						});

						handleChange(photoUrl)
						const delay = ms => new Promise(res => setTimeout(res, ms));
						await delay(1000);
					} catch (err: any) {
						throw new Error(err);
					} finally {
						uploading.value = false;
					}
				}
			}

			function onBrowseSelect(event: Event) {
				const files = (event.target as HTMLInputElement)?.files;

				if (files) {
					upload(files);
				}
			}

			return { uploading, invalid, onBrowseSelect };
		}

		const { t } = useI18n();
		const { invalid, uploading, onBrowseSelect } = useUpload();
		return {
			t, uploading, invalid, onBrowseSelect, handleChange
		};

    function handleChange(url) {
			emit('input', url);
		}
	},
});
</script>

<style lang="scss" scoped>
.validation-error {
	display: block;
	margin-top: 4px;
	color: var(--danger);
	font-style: italic;
}
.invalid {
	margin: -12px;
	padding: 12px;
	background-color: var(--danger-alt);
	border-radius: var(--border-radius);
	transition: var(--medium) var(--transition);
	transition-property: background-color,padding,margin;
}
.v-upload {
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 10px;
	color: var(--foreground-subdued);
	text-align: center;
	border: 2px dashed var(--border-normal);
	border-radius: var(--border-radius);
	transition: var(--fast) var(--transition);
	transition-property: color, border-color, background-color;

	p {
		color: inherit;
	}

	&:not(.uploading):hover {
		border-color: var(--primary);
		color: var(--primary);
	}
}

.actions {
	display: flex;
	justify-content: center;

	.v-button {
		margin-right: 12px;

		&:last-child {
			margin-right: 0;
		}
	}
}

.browse {
	position: absolute;
	top: 0;
	left: 0;
	display: block;
	width: 100%;
	height: 100%;
	cursor: pointer;
	opacity: 0;
	appearance: none;
}

.uploading {
	color: var(--white);
	background-color: var(--primary);
	border-color: var(--primary);
	border-style: solid;
}

:global(body) {
	--v-input-font-family: var(--family-sans-serif);
	--v-input-placeholder-color: var(--foreground-subdued);
	--v-input-box-shadow-color-focus: var(--primary);
	--v-input-color: var(--foreground-normal);
	--v-input-background-color: var(--background-input);
	--v-input-border-color-focus: var(--primary);
}

.v-input {
	display: flex;
	align-items: center;
	height: var(--input-height);
	margin-bottom: 10px;

	.prepend-outer {
		margin-right: 8px;
	}

	.input {
		position: relative;
		display: flex;
		flex-grow: 1;
		align-items: center;
		height: 100%;
		padding: var(--input-padding);
		padding-top: 0px;
		padding-bottom: 0px;
		color: var(--v-input-color);
		font-family: var(--v-input-font-family);
		background-color: var(--v-input-background-color);
		border: var(--border-width) solid var(--border-normal);
		border-radius: var(--border-radius);
		transition: border-color var(--fast) var(--transition);

		&.disabled {
			--arrow-color: var(--border-normal);

			color: var(--foreground-subdued);
			background-color: var(--background-subdued);
			border-color: var(--border-normal);
		}
	}

	input {
		flex-grow: 1;
		height: 100%;
		padding: var(--input-padding);
		padding-right: 0px;
		padding-left: 0px;
		font-family: var(--v-input-font-family);
		background-color: transparent;
		border: none;
		appearance: none;
		text-overflow: ellipsis;
	}
}
</style>