<script>
    import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
    import QueryForm from './QueryForm.svelte';
</script>

<Meta
    title="Components/QueryForm"
    component={QueryForm}
    argTypes={{}}
/>

<Template let:args>
    <QueryForm {...args} />
</Template>

<Story
    name="Default"
    args={{}}
/> 