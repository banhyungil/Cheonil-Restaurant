<script setup lang="ts"></script>
<template>
    <div class="sidebar">
        <div class="c-home">
            <RouterLink to="/"> <font-awesome-icon :icon="['fas', 'house']" /> 천일식당 </RouterLink>
        </div>
        <div class="c-menues">
            <RouterLink to="/account" activeClass="active">정산</RouterLink>
            <RouterLink to="/collection" activeClass="active">수금</RouterLink>
            <RouterLink to="/expenseList" activeClass="active">지출내역</RouterLink>
            <RouterLink to="/orderList" activeClass="active">주문내역</RouterLink>
            <RouterLink to="/product" activeClass="active">제품관리</RouterLink>
            <RouterLink to="/supply" activeClass="active">식자재관리</RouterLink>
            <RouterLink to="/menu" activeClass="active">메뉴 등록</RouterLink>
            <RouterLink to="/store" activeClass="active">매장 등록</RouterLink>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    min-width: 140px;
    width: 10vw;
    box-shadow: var(--box-shadow-section);

    .c-home {
        display: flex;
        font-size: 22px;
        padding: 14px;
        box-shadow: var(--box-shadow-section);
        color: rgb(var(--color-success));
    }

    .c-menues {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        row-gap: 30px;
        height: calc(100vh - 80px);

        & > a {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 120px;
            height: 70px;
            max-height: 100%;
            box-shadow: var(--box-shadow);
            text-align: center;

            @include hover;
        }

        & > .active {
            color: #fff;
            background-color: rgb(var(--color-primary));
        }
    }
}
</style>
