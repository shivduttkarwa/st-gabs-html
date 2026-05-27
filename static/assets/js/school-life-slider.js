(function () {
    function initSchoolLifeSlider() {
        if (typeof Swiper === 'undefined') return;
        const sliders = document.querySelectorAll('.sg-school-life-slider__swiper');
        if (!sliders.length) return;

        sliders.forEach((slider) => {
            if (slider.swiper) return;
            new Swiper(slider, {
                slidesPerView: 'auto',
                spaceBetween: 0,
                speed: 650,
                grabCursor: true,
                allowTouchMove: true,
                freeMode: {
                    enabled: true,
                    momentum: true,
                },
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSchoolLifeSlider);
    } else {
        initSchoolLifeSlider();
    }
})();
