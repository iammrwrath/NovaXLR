<script>
export default {
    name: "WidgetContainer",
    props: {
        title: String,
        maxWidth: { type: String, default: "fit-content"}
    }
}
</script>

<template>
    <div class="container">
        <p class="title" role="heading" aria-level="3">
            <slot name="title">{{ title }}</slot>
        </p>
        <slot></slot>
    </div>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;

    height: 220px;
    min-width: 200px;
    max-width: v-bind(maxWidth);

    background: rgba(22, 27, 39, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(8px);
}

.title {
    width: 100%;
    padding: 10px 0;

    color: #e2e8f0;
    background: rgba(30, 36, 52, 0.85);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
}
</style>
