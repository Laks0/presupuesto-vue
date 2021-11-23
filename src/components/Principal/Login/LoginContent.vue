<template>
	<form-element>
		<fieldset class="k-form-fieldset">
			<field
					:id="'email'"
					:name="'email'"
					:label="'Email'"
					:type="'email'"
					:component="'myTemplate'"
			>
				<template v-slot:myTemplate="{props}">
					<forminput
							v-bind="props"
							@change="props.onChange"
							@blur="props.onBlur"
							@focus="props.onFocus"
					/>
				</template>
			</field>

			<field
					:id="'contraseña'"
					:name="'contraseña'"
					:label="'Contraseña'"
					:type="'password'"
					:component="'myTemplate'"
			>
				<template v-slot:myTemplate="{props}">
					<forminput
							v-bind="props"
							@change="props.onChange"
							@blur="props.onBlur"
							@focus="props.onFocus"
					/>
				</template>
			</field>

			<div class="k-form-buttons">
				<kbutton
						:primary="true"
						:type="'submit'"
				>
					Aceptar
				</kbutton>
			</div>
		</fieldset>
	</form-element>
</template>

<script>
import { Field, FormElement } from "@progress/kendo-vue-form";
import { Button } from "@progress/kendo-vue-buttons";
import FormInput from "./FormInput.vue";

export default {
	components: {
		field: Field,
		"form-element": FormElement,
		kbutton: Button,
		forminput: FormInput,
	},
}
</script>
