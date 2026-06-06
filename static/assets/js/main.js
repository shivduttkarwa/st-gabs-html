function sgAsset(relativePath) {
    const base = (typeof window !== 'undefined' && window.SG_STATIC_ROOT)
        ? String(window.SG_STATIC_ROOT).replace(/\/?$/, '/')
        : '/static/';
    return base + String(relativePath).replace(/^\//, '');
}

function debounce(func, wait = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), wait);
    };
}

const blocks = document.querySelectorAll('.block-toggle-txt');
if (blocks.length !== 0) {
    blocks.forEach((block) => {
        const outer = block.querySelector('.block-toggle-txt-wrap-2');
        const inner = block.querySelector('.block-toggle-txt-wrap-3');
        const toggle = block.querySelector('.block-toggle-txt-read-toggle');
        if (!outer || !inner || !toggle) return;

        const collapsedHeight = 360;
        const fullHeight = inner.scrollHeight;
        if (fullHeight <= collapsedHeight) {
            toggle.style.display = 'none';
            outer.style.height = 'auto';
            return;
        }

        outer.classList.add('is-enable-expanded');
        outer.style.height = `${collapsedHeight}px`;
        outer.style.transition = 'height 0.4s ease';
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = block.classList.contains('expanded');
            outer.style.height = isExpanded ? `${collapsedHeight}px` : `${fullHeight}px`;
            block.classList.toggle('expanded', !isExpanded);
            outer.addEventListener('transitionend', function cb() {
                outer.removeEventListener('transitionend', cb);
                ScrollTrigger.refresh(true);
            });
        });
    });
}

let header = document.querySelector('#header');
let headerHeight = header?.offsetHeight || 0;
let headerTitles = document.querySelector('#header-full-menu__titles');
let headerTitleHeight = headerTitles?.offsetHeight || 0;

function updateHeaderVars() {
    headerHeight = header?.offsetHeight || 0;
    headerTitleHeight = headerTitles?.offsetHeight || 0;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    document.documentElement.style.setProperty('--header_titles-height', `${headerTitleHeight}px`);
}

window.addEventListener('load', updateHeaderVars);
window.addEventListener('resize', updateHeaderVars);

const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('sg-mobile-menu');
const mobileMenuBackBtn = mobileMenu?.querySelector('.sg-mobile-menu__back');
const mobileMenuRootPanel = mobileMenu?.querySelector('.sg-mobile-menu__panel--root');
const mobileMenuSubPanel = mobileMenu?.querySelector('.sg-mobile-menu__panel--submenu');
const mobileMenuSubLabel = mobileMenu?.querySelector('.sg-mobile-menu__submenu-label');
const mobileMenuSubTitle = mobileMenu?.querySelector('.sg-mobile-menu__submenu-title');
const mobileMenuSubLinks = mobileMenu?.querySelector('.sg-mobile-menu__submenu-links');
const mobileMenuSubLearn = mobileMenu?.querySelector('.sg-mobile-menu__submenu-learn');
const mobileMenuSubLearnText = mobileMenu?.querySelector('.sg-mobile-menu__submenu-learn-text');
const mobileMenuTriggers = mobileMenu ? Array.from(mobileMenu.querySelectorAll('[data-mobile-menu-trigger]')) : [];
const mobileMegaContentNodes = Array.from(document.querySelectorAll('.sg-header__mega-content-store .sg-header__mega-content[data-mega-key]'));
const mobileMegaContentMap = new Map(mobileMegaContentNodes.map((node) => [node.getAttribute('data-mega-key'), node]));
const mobileMenuBackdrop = mobileMenu?.querySelector('.sg-mobile-menu__backdrop');
const mobileMenuFrame = mobileMenu?.querySelector('.sg-mobile-menu__frame');
const mobileMenuRootItems = mobileMenu ? Array.from(mobileMenu.querySelectorAll('.sg-mobile-menu__panel--root .sg-mobile-menu__link, .sg-mobile-menu__panel--root .sg-mobile-menu__cta-link, .sg-mobile-menu__panel--root .sg-mobile-menu__donate')) : [];
let mobileMenuCloseTween = null;

function lockMobileMenuScroll() {
    document.body.classList.add('is-open-menu');
    if (lenis && typeof lenis.stop === 'function') {
        lenis.stop();
    }
    if (bodyScrollBar) {
        openModal(bodyScrollBar);
    }
}

function unlockMobileMenuScroll() {
    document.body.classList.remove('is-open-menu');
    if (lenis && typeof lenis.start === 'function') {
        lenis.start();
    }
    if (bodyScrollBar) {
        closeModal(bodyScrollBar);
    }
}

function animateMobileMenuOpen() {
    if (typeof gsap === 'undefined' || !mobileMenu) return;
    gsap.killTweensOf([mobileMenuBackdrop, mobileMenuFrame, ...mobileMenuRootItems, mobileMenuSubPanel, ...Array.from(mobileMenuSubLinks?.children ?? [])]);
    gsap.set(mobileMenuBackdrop, { autoAlpha: 0 });
    gsap.set(mobileMenuFrame, { autoAlpha: 1, y: 24 });
    gsap.set(mobileMenuRootItems, { autoAlpha: 0, y: 18 });
    gsap.set(mobileMenuSubPanel, { autoAlpha: 0, xPercent: 8 });
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(mobileMenuBackdrop, { autoAlpha: 1, duration: 0.28 }, 0)
        .to(mobileMenuFrame, { y: 0, duration: 0.52 }, 0)
        .to(mobileMenuRootItems, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.04 }, 0.08);
}

function animateMobileMenuClose(onComplete) {
    if (typeof gsap === 'undefined' || !mobileMenu) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }
    gsap.killTweensOf([mobileMenuBackdrop, mobileMenuFrame, ...mobileMenuRootItems, mobileMenuSubPanel, ...Array.from(mobileMenuSubLinks?.children ?? [])]);
    mobileMenuCloseTween = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
            mobileMenuCloseTween = null;
            if (typeof onComplete === 'function') onComplete();
        },
    })
        .to([mobileMenuRootItems, mobileMenuSubPanel], { autoAlpha: 0, y: -8, duration: 0.18, stagger: 0.015 }, 0)
        .to(mobileMenuFrame, { autoAlpha: 0, y: 18, duration: 0.22 }, 0.04)
        .to(mobileMenuBackdrop, { autoAlpha: 0, duration: 0.18 }, 0.06);
}

function animateMobileSubmenuEnter() {
    if (typeof gsap === 'undefined' || !mobileMenuRootPanel || !mobileMenuSubPanel) return;
    const subItems = mobileMenuSubLinks ? Array.from(mobileMenuSubLinks.children) : [];
    gsap.killTweensOf([mobileMenuRootPanel, mobileMenuSubPanel, subItems]);
    gsap.set(mobileMenuSubPanel, { autoAlpha: 1, xPercent: 8 });
    gsap.set(subItems, { autoAlpha: 0, y: 16 });
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(mobileMenuRootPanel, { autoAlpha: 0, xPercent: -10, duration: 0.26 }, 0)
        .to(mobileMenuSubPanel, { xPercent: 0, duration: 0.32 }, 0.04)
        .to(subItems, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.035 }, 0.12);
}

function animateMobileSubmenuExit() {
    if (typeof gsap === 'undefined' || !mobileMenuRootPanel || !mobileMenuSubPanel) return;
    const rootItems = mobileMenu ? Array.from(mobileMenu.querySelectorAll('.sg-mobile-menu__panel--root .sg-mobile-menu__link, .sg-mobile-menu__panel--root .sg-mobile-menu__cta-link, .sg-mobile-menu__panel--root .sg-mobile-menu__donate')) : [];
    gsap.killTweensOf([mobileMenuRootPanel, mobileMenuSubPanel, rootItems]);
    gsap.set(mobileMenuRootPanel, { autoAlpha: 1, xPercent: -10 });
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(mobileMenuSubPanel, { autoAlpha: 0, xPercent: 8, duration: 0.24 }, 0)
        .to(mobileMenuRootPanel, { xPercent: 0, duration: 0.3 }, 0.04)
        .fromTo(rootItems, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.26, stagger: 0.025 }, 0.12);
}

function setMobileMenuExpandedState(isExpanded) {
    if (menuBtn) {
        menuBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }
    if (mobileMenu) {
        mobileMenu.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
    }
}

function showMobileMenuRoot() {
    if (!mobileMenuRootPanel || !mobileMenuSubPanel) return;
    mobileMenuRootPanel.setAttribute('aria-hidden', 'false');
    mobileMenuSubPanel.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('is-submenu-open');
    if (mobileMenuSubLinks) {
        mobileMenuSubLinks.scrollTop = 0;
    }
}

function populateMobileSubmenu(key) {
    const contentNode = mobileMegaContentMap.get(key);
    if (!contentNode || !mobileMenuSubLinks || !mobileMenuSubTitle || !mobileMenuSubLabel || !mobileMenuSubLearn || !mobileMenuSubLearnText) return false;

    const titleMain = contentNode.querySelector('.sg-header__mega-title-main')?.textContent?.trim() || 'Explore';
    const titleSub = contentNode.querySelector('.sg-header__mega-title-sub')?.textContent?.trim() || titleMain;
    const learnLink = contentNode.querySelector('.sg-header__mega-learn');
    const submenuLinks = contentNode.querySelector('.sg-header__mega-submenu-links');

    mobileMenuSubLabel.textContent = titleMain;
    mobileMenuSubTitle.textContent = titleSub;
    mobileMenuSubLinks.innerHTML = submenuLinks ? submenuLinks.innerHTML : '';
    mobileMenuSubLearn.href = learnLink?.getAttribute('href') || '#';
    mobileMenuSubLearnText.textContent = learnLink?.querySelector('.sg-header__mega-learn-text')?.textContent?.trim() || 'Learn more';
    return true;
}

function openMobileSubmenu(key) {
    if (!mobileMenuRootPanel || !mobileMenuSubPanel) return;
    if (!populateMobileSubmenu(key)) return;
    if (mobileMenuSubLinks) {
        mobileMenuSubLinks.scrollTop = 0;
        requestAnimationFrame(() => {
            mobileMenuSubLinks.scrollTop = 0;
        });
    }
    mobileMenuSubPanel.setAttribute('aria-hidden', 'false');
    mobileMenu.classList.add('is-submenu-open');
    animateMobileSubmenuEnter();
    const backBtn = mobileMenuSubPanel.querySelector('.sg-mobile-menu__back');
    if (backBtn) backBtn.focus();
    mobileMenuRootPanel.setAttribute('aria-hidden', 'true');
}

function closeMobileMenu() {
    if (!document.body.classList.contains('is-open-menu')) return;
    animateMobileMenuClose(() => {
        unlockMobileMenuScroll();
        showMobileMenuRoot();
        setMobileMenuExpandedState(false);
        if (typeof gsap !== 'undefined') {
            gsap.set([mobileMenuFrame, mobileMenuBackdrop, mobileMenuRootPanel, mobileMenuSubPanel, ...mobileMenuRootItems, ...Array.from(mobileMenuSubLinks?.children ?? [])], { clearProps: 'all' });
        }
    });
}

function closeMobileMenuImmediate() {
    if (!document.body.classList.contains('is-open-menu')) return;
    if (mobileMenuCloseTween && typeof mobileMenuCloseTween.kill === 'function') {
        mobileMenuCloseTween.kill();
        mobileMenuCloseTween = null;
    }
    if (typeof gsap !== 'undefined') {
        gsap.killTweensOf([mobileMenuBackdrop, mobileMenuFrame, mobileMenuRootPanel, mobileMenuSubPanel, ...mobileMenuRootItems, ...Array.from(mobileMenuSubLinks?.children ?? [])]);
        gsap.set([mobileMenuFrame, mobileMenuBackdrop, mobileMenuRootPanel, mobileMenuSubPanel, ...mobileMenuRootItems, ...Array.from(mobileMenuSubLinks?.children ?? [])], { clearProps: 'all' });
    }
    unlockMobileMenuScroll();
    showMobileMenuRoot();
    setMobileMenuExpandedState(false);
}

function openMobileMenu() {
    if (window.innerWidth > 991) return;
    closeHeaderSearchMenu();
    closeHeaderMegaMenu();
    lockMobileMenuScroll();
    showMobileMenuRoot();
    setMobileMenuExpandedState(true);
    animateMobileMenuOpen();
}

if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (document.body.classList.contains('is-open-menu')) {
            closeMobileMenu();
            return;
        }
        openMobileMenu();
    });
}

if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', () => {
        closeMobileMenu();
    });
}

if (mobileMenuBackBtn) {
    mobileMenuBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showMobileMenuRoot();
        animateMobileSubmenuExit();
    });
}

if (mobileMenuTriggers.length) {
    mobileMenuTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openMobileSubmenu(trigger.getAttribute('data-mobile-menu-trigger'));
        });
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('is-open-menu')) {
        closeMobileMenu();
    }
});

window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 991) {
        closeMobileMenu();
    }
}, 80));

const megaNavPanel = document.querySelector('.sg-header__nav-panel');
const megaMenu = document.getElementById('sg-header-mega');
const megaTriggers = document.querySelectorAll('.sg-header__nav-link--mega');
const searchLinks = Array.from(document.querySelectorAll('#sg-header-search-link, #sg-header-search-link-mobile'));
const searchMenu = document.getElementById('sg-header-search-menu');
const searchInput = document.getElementById('sg-search-input');
const searchSubmit = document.getElementById('sg-search-submit');
const searchClear = document.getElementById('sg-search-clear');
const searchPopularCol = document.getElementById('sg-search-popular-col');
const searchResultsBlock = document.getElementById('sg-search-results-block');
const searchResultsTitle = document.getElementById('sg-search-results-title');
const searchMenuOriginalParent = searchMenu ? searchMenu.parentElement : null;
const searchMenuOriginalNextSibling = searchMenu ? searchMenu.nextElementSibling : null;

function syncSearchMenuMount() {
    if (!searchMenu || !header || !searchMenuOriginalParent) return;

    if (window.innerWidth < 992) {
        if (searchMenu.parentElement !== header) {
            header.appendChild(searchMenu);
        }
        return;
    }

    if (searchMenu.parentElement !== searchMenuOriginalParent) {
        if (searchMenuOriginalNextSibling && searchMenuOriginalNextSibling.parentElement === searchMenuOriginalParent) {
            searchMenuOriginalParent.insertBefore(searchMenu, searchMenuOriginalNextSibling);
        } else {
            searchMenuOriginalParent.appendChild(searchMenu);
        }
    }
}

syncSearchMenuMount();
window.addEventListener('resize', debounce(syncSearchMenuMount, 80));

function closeHeaderSearchMenu() {
    if (!searchMenu || !searchLinks.length || !searchMenu.classList.contains('is-open')) return;
    searchMenu.classList.remove('is-open');
    searchMenu.setAttribute('aria-hidden', 'true');
    searchLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.setAttribute('aria-expanded', 'false');
    });
    document.body.classList.remove('is-open-menu-2');
}

function closeHeaderMegaMenu() {
    const navPanel = document.querySelector('.sg-header__nav-panel');
    const menu = document.getElementById('sg-header-mega');
    if (!navPanel || !menu || !navPanel.classList.contains('is-mega-open')) return;

    navPanel.classList.remove('is-mega-open');
    menu.setAttribute('aria-hidden', 'true');
    const activeLink = navPanel.querySelector('.sg-header__nav-link--mega.is-mega-active');
    if (activeLink) activeLink.classList.remove('is-mega-active');
}

if (megaNavPanel && megaMenu && megaTriggers.length) {
    const megaPanel = megaMenu.querySelector('.sg-header__mega-panel');
    const megaContentNodes = Array.from(megaMenu.querySelectorAll('.sg-header__mega-content[data-mega-key]'));
    const megaContentMap = new Map(megaContentNodes.map((node) => [node.getAttribute('data-mega-key'), node]));

    let megaCloseTimer = null;
    let megaOpenLink = null;
    let megaActiveKey = null;
    let megaSwapTimer = null;

    const clearMegaTimer = () => {
        if (megaCloseTimer) {
            clearTimeout(megaCloseTimer);
            megaCloseTimer = null;
        }
    };

    const updateMegaTail = (link) => {
        const panelRect = megaNavPanel.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        const menuLeft = panelRect.left + (parseFloat(megaMenu.style.left) || megaMenu.offsetLeft || 0);
        const menuWidth = parseFloat(megaMenu.style.width) || megaMenu.offsetWidth || window.innerWidth;
        const linkCenter = linkRect.left + (linkRect.width / 2);
        const tailLeft = Math.max(48, Math.min(menuWidth - 48, linkCenter - menuLeft));
        megaMenu.style.setProperty('--mega-tail-left', `${tailLeft}px`);
        megaMenu.style.setProperty('--mega-origin-x', `${tailLeft}px`);
    };

    const alignMegaBounds = () => {
        const panelRect = megaNavPanel.getBoundingClientRect();
        const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
        const sideGap = 5 * rootFontSize;
        const width = Math.max(0, window.innerWidth - (2 * sideGap));
        const left = sideGap - panelRect.left;
        megaMenu.style.left = `${left}px`;
        megaMenu.style.width = `${width}px`;
        megaMenu.style.maxWidth = `${width}px`;
    };

    const updateMegaContent = (key) => {
        if (!megaPanel) return;
        if (megaActiveKey === key && megaPanel.innerHTML.trim()) return;
        const contentNode = megaContentMap.get(key) || megaContentMap.get('about') || megaContentNodes[0];
        if (!contentNode) return;

        const applyContent = () => {
            megaPanel.innerHTML = contentNode.innerHTML;
            megaActiveKey = key;
            requestAnimationFrame(() => megaPanel.classList.remove('is-switching'));
        };

        if (megaSwapTimer) {
            clearTimeout(megaSwapTimer);
            megaSwapTimer = null;
        }

        if (!megaPanel.innerHTML.trim() || !megaNavPanel.classList.contains('is-mega-open')) {
            applyContent();
            return;
        }

        megaPanel.classList.add('is-switching');
        megaSwapTimer = setTimeout(() => {
            applyContent();
            megaSwapTimer = null;
        }, 90);
    };

    const closeMega = () => {
        if (window.innerWidth < 992) return;
        if (megaSwapTimer) {
            clearTimeout(megaSwapTimer);
            megaSwapTimer = null;
        }
        if (megaPanel) {
            megaPanel.classList.remove('is-switching');
        }
        closeHeaderMegaMenu();
        megaOpenLink = null;
    };

    const openMega = (link) => {
        if (window.innerWidth < 992) return;
        closeHeaderSearchMenu();
        if (megaOpenLink && megaOpenLink !== link) {
            megaOpenLink.classList.remove('is-mega-active');
        }
        megaOpenLink = link;
        megaOpenLink.classList.add('is-mega-active');
        const key = link.getAttribute('data-mega-trigger') || 'about';
        updateMegaContent(key);
        alignMegaBounds();
        updateMegaTail(link);
        megaNavPanel.classList.add('is-mega-open');
        megaMenu.setAttribute('aria-hidden', 'false');
    };

    megaTriggers.forEach((link) => {
        link.addEventListener('mouseenter', () => {
            clearMegaTimer();
            openMega(link);
        });
    });

    const topRow = megaNavPanel.querySelector('.sg-header__top-row');
    if (topRow) {
        topRow.addEventListener('mouseenter', () => {
            clearMegaTimer();
            closeMega();
        });
    }

    megaNavPanel.addEventListener('mouseleave', () => {
        clearMegaTimer();
        megaCloseTimer = setTimeout(closeMega, 120);
    });

    megaNavPanel.addEventListener('mouseenter', clearMegaTimer);

    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth < 992) {
            closeMega();
            closeHeaderSearchMenu();
        } else if (megaOpenLink) {
            alignMegaBounds();
            updateMegaTail(megaOpenLink);
        }
    }, 80));
}

if (megaNavPanel && searchMenu && searchLinks.length) {
    const alignSearchBounds = () => {
        const panelRect = megaNavPanel.getBoundingClientRect();
        const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
        const sideGap = 5 * rootFontSize;
        const width = Math.max(0, window.innerWidth - (2 * sideGap));
        const left = sideGap - panelRect.left;
        searchMenu.style.left = `${left}px`;
        searchMenu.style.width = `${width}px`;
        searchMenu.style.maxWidth = `${width}px`;
    };

    const setSearchState = (hasInput) => {
        if (!searchSubmit || !searchClear || !searchPopularCol || !searchResultsBlock) return;
        searchSubmit.classList.toggle('is-active', !hasInput);
        searchClear.classList.toggle('is-active', hasInput);
        searchPopularCol.classList.toggle('d-none', hasInput);
        searchResultsBlock.classList.toggle('d-none', !hasInput);
    };

    const getMobileSearchAnimItems = () => {
        if (!searchMenu) return [];
        const content = searchMenu.querySelector('.sg-search-menu__content');
        if (!content) return [];

        const items = [];
        const pushIfVisible = (node) => {
            if (!node || node.classList.contains('d-none')) return;
            items.push(node);
        };

        pushIfVisible(content.querySelector('.sg-search-menu__title'));
        pushIfVisible(content.querySelector('.sg-search-menu__search-block'));

        if (searchResultsBlock && !searchResultsBlock.classList.contains('d-none')) {
            pushIfVisible(searchResultsTitle);
            searchResultsBlock.querySelectorAll('.sg-search-menu__results-item').forEach(pushIfVisible);
        } else if (searchPopularCol && !searchPopularCol.classList.contains('d-none')) {
            pushIfVisible(searchPopularCol.querySelector('.sg-search-menu__second-title'));
            searchPopularCol.querySelectorAll('.sg-search-menu__popular-link').forEach(pushIfVisible);
        }

        return items;
    };

    const animateMobileSearchOpen = () => {
        if (typeof gsap === 'undefined' || window.innerWidth > 991 || !searchMenu) return;

        const content = searchMenu.querySelector('.sg-search-menu__content');
        if (!content) return;

        const items = getMobileSearchAnimItems();
        gsap.killTweensOf([content, ...items]);
        gsap.set(content, { autoAlpha: 1, y: 18 });
        gsap.set(items, { autoAlpha: 0, y: 18 });
        gsap.timeline({ defaults: { ease: 'power3.out' } })
            .to(content, { y: 0, duration: 0.32 }, 0)
            .to(items, { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.04 }, 0.06);
    };

    const openSearch = () => {
        if (window.innerWidth < 992 && document.body.classList.contains('is-open-menu')) {
            closeMobileMenuImmediate();
        } else if (document.body.classList.contains('is-open-menu')) {
            closeMobileMenu();
        }
        closeHeaderMegaMenu();
        if (window.innerWidth < 992) {
            searchMenu.style.left = '0';
            searchMenu.style.width = '100%';
            searchMenu.style.maxWidth = '100%';
        } else {
            alignSearchBounds();
        }
        searchMenu.classList.add('is-open');
        searchMenu.setAttribute('aria-hidden', 'false');
        searchLinks.forEach((link) => {
            link.classList.add('is-active');
            link.setAttribute('aria-expanded', 'true');
        });
        document.body.classList.add('is-open-menu-2');
        document.body.classList.remove('is-open-menu');
        animateMobileSearchOpen();
    };

    searchLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchMenu.classList.contains('is-open')) {
                closeHeaderSearchMenu();
                return;
            }
            openSearch();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = (e.target.value || '').trim();
            const hasInput = /[a-z0-9]/i.test(value);
            setSearchState(hasInput);
            if (searchResultsTitle) {
                searchResultsTitle.textContent = hasInput
                    ? `Search Results for '${value}'`
                    : 'Search Results';
            }
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            if (!searchInput) return;
            searchInput.value = '';
            setSearchState(false);
            if (searchResultsTitle) {
                searchResultsTitle.textContent = 'Search Results';
            }
            searchInput.focus();
        });
    }

    document.addEventListener('click', (e) => {
        if (!searchMenu.classList.contains('is-open')) return;
        const clickedSearchToggle = searchLinks.some((link) => link.contains(e.target));
        if (searchMenu.contains(e.target) || clickedSearchToggle) return;
        closeHeaderSearchMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeHeaderSearchMenu();
        }
    });

    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth < 992) {
            closeHeaderSearchMenu();
            return;
        }
        if (searchMenu.classList.contains('is-open')) {
            alignSearchBounds();
        }
    }, 80));
}

document.querySelectorAll('.tabs-block-js').forEach((block) => {
    block.querySelectorAll('.tab-title-js').forEach((caller) => {
        caller.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSelector = caller.getAttribute('href');
            const target = block.querySelector(targetSelector);
            const others = block.querySelectorAll('.tab-content-js.is-active');
            const titles = block.querySelectorAll('.tab-title-js.is-active');

            if (!target) return;
            [...titles].forEach((el) => el.classList.remove('is-active'));
            caller.classList.add('is-active');
            [...block.querySelectorAll('.tab-title-js')].forEach((el) => el.classList.add('not-allow'));
            [...others].forEach((el) => el.classList.remove('is-animated', 'is-active'));
            target.classList.add('is-active');

            requestAnimationFrame(() => {
                requestAnimationFrame(() => target.classList.add('is-animated'));
                if (!caller.classList.contains('header-full-menu__title-link')) {
                    ScrollTrigger.refresh(true);
                }
            });
            [...block.querySelectorAll('.tab-title-js')].forEach((el) => el.classList.remove('not-allow'));
        });
    });
});

function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || (!!window.safari && typeof window.safari === 'object') || (typeof window.ApplePaySession !== 'undefined');
}

function isWindows() {
    return /windows/i.test(navigator.userAgent);
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function isEnableCustomScroll() {
    const hasDisabledScroll = document.querySelector('.disabled-smooth-scroll-js');
    if (hasDisabledScroll) {
        document.body.classList.add('smooth-scroll-css');
        return true;
    }
   return 'ontouchstart' in window || navigator.maxTouchPoints > 0;

}

window.isSafari = isSafari;
window.isEnableCustomScroll = isEnableCustomScroll;

if (isSafari()) {
    document.documentElement.classList.add('safari-browser');
}
if (isWindows()) {
    document.documentElement.classList.add('windows-browser');
}
if (isTouchDevice()) {
    document.body.classList.add('is-touch-device');
}

let vh_ = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh_}px`);
document.documentElement.style.setProperty('--vh-2', `${vh_}px`);
const isMobile = /iPhone|iPad|iPod|midp|rv:1.2.3.4|ucweb|windows ce|windows mobile|BlackBerry|IEMobile|Opera Mini|Android/i.test(navigator.userAgent);

window.addEventListener('resize', () => {
    vh_ = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh_}px`);
    if (!isMobile) {
        document.documentElement.style.setProperty('--vh-2', `${vh_}px`);
    }
});

let lenis = null;
let bodyScrollBar = null;
let isOffsetTop = false;
let lastHeaderScrollY = 0;
const headerTopThreshold = 16;

function scrollOffset(scroll) {
    const currentHeaderScrollY = scroll <= headerTopThreshold ? 0 : scroll;
    const isScrollingDown = currentHeaderScrollY > lastHeaderScrollY;

    if (
        isScrollingDown
        && scroll > 0
        && document.querySelector('.sg-header__nav-panel.is-mega-open')
        && !megaNavPanel?.matches(':hover')
    ) {
        closeHeaderMegaMenu();
    }
    const isSearchToggleHovered = Array.isArray(searchLinks)
        ? searchLinks.some((link) => link && link.matches(':hover'))
        : false;

    if (
        isScrollingDown
        && scroll > 0
        && searchMenu?.classList.contains('is-open')
        && !searchMenu.matches(':hover')
        && !isSearchToggleHovered
    ) {
        closeHeaderSearchMenu();
    }

    if (currentHeaderScrollY > 0) {
        if (!isOffsetTop) {
            document.body.classList.add('is-offset-top');
            isOffsetTop = true;
        }
    } else if (isOffsetTop) {
        document.body.classList.remove('is-offset-top');
        isOffsetTop = false;
    }

    lastHeaderScrollY = currentHeaderScrollY;
}

function scrollDir(direction) {
    document.body.classList.toggle('scroll-down', direction === 1);
}

function openModal(scrollbar) {
    scrollbar.updatePluginOptions('modal', { open: true });
}

function closeModal(scrollbar) {
    scrollbar.updatePluginOptions('modal', { open: false });
}

window.openModal = openModal;
window.closeModal = closeModal;

if (!isEnableCustomScroll()) {
    if (!isSafari()) {
        document.body.classList.add('Lenis-init');
        lenis = new Lenis({
            duration: 1.5,
            smooth: true,
            direction: 'vertical',
            gestureDirection: 'vertical',
            syncTouch: true,
            smoothTouch: false,
            touchMultiplier: 1.5,
            wheelMultiplier: 0.8,
            wrapper: document.body.querySelector('#body-content-wrap'),
            content: document.body.querySelector('#body-content'),
        });

        lenis.on('scroll', ({ scroll, direction }) => {
            ScrollTrigger.update();
            scrollOffset(scroll);
            scrollDir(direction);
        });

        gsap.ticker.add((time) => lenis.raf(1000 * time));
        gsap.ticker.lagSmoothing(0);
        if (window.is_preloader) {
            lenis.stop();
        }
    } else {
        document.body.classList.add('Scrollbar-init');
        const elements = document.querySelectorAll('.custom-scrollbar');
        elements.forEach((el) => {
            el.classList.remove('custom-scrollbar', 'hide-scrollbar');
            el.setAttribute('data-scrollbar', '');
        });

        const ScrollbarPlugin = window.Scrollbar.ScrollbarPlugin;
        const Scrollbar = window.Scrollbar;
        class ModalPlugin extends ScrollbarPlugin {
            static pluginName = 'modal';
            static defaultOptions = { open: false };
            transformDelta(delta) {
                return this.options.open ? { x: 0, y: 0 } : delta;
            }
        }
        Scrollbar.use(ModalPlugin);
        Scrollbar.initAll({
            ignoreEvents: (event) => event.target.closest('[data-scroll="exclude"]'),
        });

        const scrollableBlocks = document.querySelectorAll('[data-scroll="exclude"]');
        scrollableBlocks.forEach((block) => {
            block.addEventListener('wheel', (e) => e.stopPropagation(), { passive: false });
            block.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: false });
        });

        bodyScrollBar = Scrollbar.get(document.querySelector('#body-content-wrap'));
        ScrollTrigger.scrollerProxy('#body-content-wrap', {
            scrollTop(value) {
                if (arguments.length) {
                    bodyScrollBar.scrollTop = value;
                }
                return bodyScrollBar.scrollTop;
            },
            getBoundingClientRect() {
                return {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            },
        });

        let lastScrollTop = 0;
        bodyScrollBar.addListener(() => {
            ScrollTrigger.update();
            const currentScrollTop = bodyScrollBar.offset.y;
            const direction = currentScrollTop > lastScrollTop ? 1 : -1;
            scrollDir(direction);
            scrollOffset(currentScrollTop);
            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        });

        if (window.is_preloader) {
            openModal(bodyScrollBar);
        }
    }
}

if (isEnableCustomScroll()) {
    let lastScrollTop_ = 0;
    scrollOffset(window.scrollY);
    window.addEventListener('scroll', () => {
        scrollOffset(window.scrollY);
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        document.body.classList.toggle('scroll-down', currentScrollTop > lastScrollTop_);
        lastScrollTop_ = currentScrollTop <= 0 ? 0 : currentScrollTop;
    });
}

window.getLenis = () => lenis;
window.getBodyScrollBar = () => bodyScrollBar;

function setScrollTrigger() {
    const scroller = !isEnableCustomScroll() ? '#body-content-wrap' : 'body';
    ScrollTrigger.defaults({
        scroller,
        pinType: !isEnableCustomScroll() ? 'transform' : 'fixed',
    });
}

setScrollTrigger();
window.addEventListener('resize', setScrollTrigger);
window.addEventListener('load', () => {
    document.body.classList.add('window-load');
    ScrollTrigger.refresh(true);
});

const triggers = document.querySelectorAll('[data-scrollto]');
if (triggers.length) {
    triggers.forEach((trigger) => {
        trigger.addEventListener('click', function (event) {
            const elementId = this.getAttribute('data-scrollto');
            const target = document.querySelector(elementId);
            if (!target) return;

            let paddingOffset = 0;
            if (this.hasAttribute('data-scroll-offset-default') && header) {
                paddingOffset = header.offsetHeight;
                if (window.innerWidth < 992) paddingOffset += 40;
            }

            const targetOffset = target.getBoundingClientRect().top + window.pageYOffset - paddingOffset;
            if (!isEnableCustomScroll()) {
                if (!isSafari()) {
                    lenis.scrollTo(target, {
                        offset: paddingOffset,
                        immediate: false,
                        duration: 1.2,
                        easing: (t) => t,
                    });
                } else {
                    bodyScrollBar.scrollIntoView(target, {
                        offsetLeft: 0,
                        offsetTop: paddingOffset,
                        alignToTop: true,
                        onlyScrollIfNeeded: false,
                    });
                }
            } else {
                window.scrollTo({ top: targetOffset, behavior: 'smooth' });
            }
            event.preventDefault();
        });
    });
}

function slideUp(element, duration = 300, callback) {
    if (!element || element.dataset.sliding === 'true') return;
    element.dataset.sliding = 'true';
    const height = element.offsetHeight;
    element.style.height = `${height}px`;
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease, opacity ${duration}ms ease`;
    element.offsetHeight;
    requestAnimationFrame(() => {
        element.style.height = '0px';
        element.style.opacity = '0';
    });
    setTimeout(() => {
        element.style.display = 'none';
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition');
        element.style.removeProperty('opacity');
        delete element.dataset.sliding;
        if (typeof callback === 'function') callback();
    }, duration);
}

function slideDown(element, duration = 300, callback) {
    if (!element || element.dataset.sliding === 'true') return;
    element.dataset.sliding = 'true';
    element.style.removeProperty('display');
    let display = window.getComputedStyle(element).display;
    if (display === 'none') display = 'block';
    element.style.display = display;
    element.style.height = 'auto';
    const targetHeight = element.offsetHeight;
    element.style.height = '0';
    element.style.opacity = '0';
    element.style.overflow = 'hidden';
    element.offsetHeight;
    element.style.transition = `height ${duration}ms ease, opacity ${duration}ms ease`;
    requestAnimationFrame(() => {
        element.style.height = `${targetHeight}px`;
        element.style.opacity = '1';
    });
    setTimeout(() => {
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition');
        element.style.removeProperty('opacity');
        delete element.dataset.sliding;
        if (typeof callback === 'function') callback();
    }, duration);
}

document.querySelectorAll('.sg-video').forEach((video) => {
    video.addEventListener('mouseenter', () => {
        if (video.paused) video.play();
    });
    video.addEventListener('mouseleave', () => {
        if (!video.paused) video.pause();
    });
});

document.querySelectorAll('.sg-video-overlay').forEach((overlay) => {
    overlay.addEventListener('mouseenter', () => {
        const parent = overlay.closest('.sg-video-container') || overlay.parentElement;
        const video = parent.querySelector('.sg-video');
        if (video && video.paused) video.play();
    });
    overlay.addEventListener('mouseleave', () => {
        const parent = overlay.closest('.sg-video-container') || overlay.parentElement;
        const video = parent.querySelector('.sg-video');
        if (video && !video.paused) video.pause();
    });
});

const heroSwiperEl = document.querySelector('.sg-hero__swiper');
let heroSwiperInstance = null;
let heroSlideAnimTimeout = null;
const isMobileViewport = () => window.innerWidth <= 991;

function syncHeroVideos(swiper) {
    swiper.slides.forEach((slide, i) => {
        const v = slide.querySelector('video.sg-hero__bg');
        if (!v) return;
        const isActive = i === swiper.activeIndex;
        if (v.classList.contains('video-js') && window.videojs && v.id) {
            const player = window.videojs.getPlayer(v.id);
            if (player) {
                isActive ? player.play().catch(() => {}) : player.pause();
                return;
            }
        }
        isActive ? v.play().catch(() => {}) : v.pause();
    });
}

function resetMobileHeroImage(slide) {
    if (!slide || !isMobileViewport() || typeof gsap === 'undefined') return;
    const bg = slide.querySelector('.sg-hero__bg');
    if (!bg) return;
    gsap.killTweensOf(bg);
    gsap.set(bg, { clearProps: 'transform', scale: 1, x: 0, y: 0 });
}

window.getHeroSwiperInstance = () => heroSwiperInstance;

if (heroSwiperEl && !heroSwiperEl.swiper) {
    const hasPreloader = !!document.querySelector('#preloader');
    const heroPrevBtn = heroSwiperEl.closest('.sg-hero')?.querySelector('.sg-hero__arrow-prev');
    const heroNextBtn = heroSwiperEl.closest('.sg-hero')?.querySelector('.sg-hero__arrow-next');

    function updateHeroNavState(swiper) {
        if (heroPrevBtn) heroPrevBtn.disabled = swiper.activeIndex === 0;
        if (heroNextBtn) heroNextBtn.disabled = swiper.activeIndex === swiper.slides.length - 1;
    }

    heroSwiperInstance = new Swiper(heroSwiperEl, {
        loop: false,
        speed: 900,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        navigation: {
            nextEl: '.sg-hero__arrow-next',
            prevEl: '.sg-hero__arrow-prev',
        },
        on: {
            afterInit(swiper) {
                updateHeroNavState(swiper);
                swiper.slides.forEach((slide) => resetMobileHeroImage(slide));
                if (window.SGAnimations) {
                    window.SGAnimations.resetHeroSlides(swiper, !hasPreloader, !hasPreloader);
                }
                if (hasPreloader) return;
                requestAnimationFrame(() => {
                    if (window.SGAnimations) {
                        window.SGAnimations.animateCurrentHeroSlide(swiper, true, true);
                    }
                });
            },
            slideChangeTransitionStart(swiper) {
                updateHeroNavState(swiper);
                if (heroSlideAnimTimeout) {
                    clearTimeout(heroSlideAnimTimeout);
                    heroSlideAnimTimeout = null;
                }
                swiper.slides.forEach((slide) => resetMobileHeroImage(slide));
                if (window.SGAnimations) {
                    window.SGAnimations.resetHeroSlides(swiper, true, true);
                }
                const incoming = swiper.slides[swiper.activeIndex];
                heroSlideAnimTimeout = setTimeout(() => {
                    if (incoming && window.SGAnimations) {
                        incoming.classList.add('sg-hero__slide--anim');
                        window.SGAnimations.animateHeroSlide(incoming, true, true);
                    }
                    heroSlideAnimTimeout = null;
                }, 120);
            },
            slideChangeTransitionEnd(swiper) {
                syncHeroVideos(swiper);
            },
        },
    });

    window.addEventListener('load', () => {
        if (heroSwiperInstance) {
            setTimeout(() => {
                syncHeroVideos(heroSwiperInstance);
            }, 300);
        }
    });
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

window.getCookie = getCookie;

document.querySelectorAll('.modal__close-btn,.modal__overlay').forEach((btn) => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (!modal) return;
        modal.classList.remove('is-open');
        if (modal.id === 'modal') {
            setCookie('modalClose', 'true', 7);
        }
    });
});

document.querySelectorAll('.sg-modal-caller').forEach((caller) => {
    caller.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSelector = caller.getAttribute('href');
        const modal = document.querySelector(targetSelector);
        if (modal) modal.classList.add('is-open');
    });
});

const headerNav = document.querySelector('#header__nav');
const headerBtns = document.querySelector('#header-mob-btns');
if (headerNav && headerBtns) {
    function moveNavItems() {
        if (window.innerWidth < 992 && headerNav.children.length > 0) {
            [...headerNav.querySelectorAll('li')].forEach((li) => headerBtns.appendChild(li));
        }
        if (window.innerWidth > 991 && headerBtns.children.length > 0) {
            [...headerBtns.querySelectorAll('li')].forEach((li) => headerNav.appendChild(li));
        }
    }
    moveNavItems();
    window.addEventListener('resize', debounce(moveNavItems));
}

if (document.querySelectorAll('.header-full-menu__content-block-row').length) {
    function blockMix() {
        document.querySelectorAll('.header-full-menu__content-block-row').forEach((item) => {
            const respBlock = item.querySelector('.header-full-menu__content-block-col--responsive');
            const blocks = item.querySelectorAll('.header-full-menu__content-block-col--1, .header-full-menu__content-block-col--2, .header-full-menu__content-block-col--4');
            if (window.innerWidth < 1200 && respBlock && item.children.length > 2) {
                blocks.forEach((block) => respBlock.appendChild(block));
            }
            if (window.innerWidth > 1199 && respBlock && respBlock.children.length > 0) {
                blocks.forEach((block) => item.appendChild(block));
            }
        });
    }
    blockMix();
    window.addEventListener('resize', debounce(blockMix));
}

const accItems = document.querySelectorAll('.sg-acc-items');
if (accItems.length) {
    accItems.forEach((item) => {
        const titles = item.querySelectorAll('.sg-acc-title:not(.sg-acc-title-disable)');
        titles.forEach((title) => {
            title.addEventListener('click', (e) => {
                e.preventDefault();
                const accItem = title.closest('.sg-acc-item');
                const accContent = accItem.querySelector('.sg-acc-content');
                const accBlockActive = Array.from(item.querySelectorAll('.sg-acc-item.open')).filter((el) => el !== accItem)[0] || null;
                const accContentActive = accBlockActive ? accBlockActive.querySelector('.sg-acc-content') : null;

                if (accItem.classList.contains('open')) {
                    accItem.classList.remove('open');
                    accItem.classList.add('pointer-event-none');
                    slideUp(accContent, 400, () => {
                        ScrollTrigger.refresh(true);
                        accItem.classList.remove('pointer-event-none');
                    });
                } else {
                    if (accBlockActive) {
                        accBlockActive.classList.remove('open');
                        accBlockActive.classList.add('pointer-event-none');
                        slideUp(accContentActive, 400, () => {
                            ScrollTrigger.refresh(true);
                            accBlockActive.classList.remove('pointer-event-none');
                        });
                    }
                    accItem.classList.add('open', 'pointer-event-none');
                    slideDown(accContent, 400, () => {
                        ScrollTrigger.refresh(true);
                        accItem.classList.remove('pointer-event-none');
                    });
                }
            });
        });
    });
}

function initAppSwipers() {
    const gallerySliders = document.querySelectorAll('.sg-gallery-slider');
    if (gallerySliders.length) {
        gallerySliders.forEach(function(container) {
            const swiperEl = container.querySelector('.sg-gallery-slider__swiper');
            const caption = container.querySelector('.sg-gallery-slider__caption');
            const prevBtn = container.querySelector('.sg-gallery-slider__arrow--prev');
            const nextBtn = container.querySelector('.sg-gallery-slider__arrow--next');
            if (!swiperEl) return;
            let latestCaptionText = '';
            const swiper = new Swiper(swiperEl, {
                loop: true,
                speed: 900,
                effect: 'fade',
                fadeEffect: { crossFade: true },
                waitForTransition: false,
                autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
                on: {
                    slideChange: function() {
                        if (!caption) return;
                        const active = this.slides[this.activeIndex];
                        const text = active && active.dataset.caption;
                        if (!text) return;
                        latestCaptionText = text;
                        if (typeof gsap !== 'undefined') {
                            gsap.killTweensOf(caption);
                            gsap.to(caption, {
                                autoAlpha: 0,
                                y: -14,
                                duration: 0.25,
                                ease: 'power2.in',
                                onComplete: function() {
                                    caption.textContent = latestCaptionText;
                                    gsap.fromTo(caption,
                                        { autoAlpha: 0, y: 14 },
                                        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }
                                    );
                                }
                            });
                        } else {
                            caption.textContent = text;
                        }
                    }
                }
            });
            if (prevBtn) prevBtn.addEventListener('click', () => swiper.slidePrev(300));
            if (nextBtn) nextBtn.addEventListener('click', () => swiper.slideNext(300));
        });
    }

    const navRowSlider = document.querySelectorAll('.sg-nav-row__slider');
    if (navRowSlider.length) {
        new Swiper('.sg-nav-row__slider', {
            speed: 300,
            spaceBetween: 20,
            slidesPerView: 'auto',
            freeMode: true,
            threshold: 15,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                5760: {
                    spaceBetween: 30,
                },
            },
        });
    }

    const headerSlider = document.querySelectorAll('.sg-header-menu__titles-swiper');
    if (headerSlider.length) {
        new Swiper('.sg-header-menu__titles-swiper', {
            speed: 300,
            spaceBetween: 0,
            slidesPerView: 'auto',
            freeMode: true,
            threshold: 15,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    const sliderBlocks = document.querySelectorAll('.sg-complex-sliders-block');
    if (sliderBlocks.length) {
        sliderBlocks.forEach((item) => {
            const pics = item.querySelector('.sg-slider-pics');
            const contents = item.querySelector('.sg-slider-contents');
            if (!pics || !contents) return;
            const isSplitSliderBlock = item.classList.contains('sg-split-slider');

            const syncHeight = () => {
                if (contents.offsetHeight > pics.offsetHeight) {
                    pics.style.height = `${contents.offsetHeight}px`;
                }
            };

            if (!isSplitSliderBlock && window.innerWidth > 991) {
                syncHeight();
                window.addEventListener('resize', debounce(syncHeight));
            }

            let picsSwiper;
            if (isSplitSliderBlock) {
                picsSwiper = new Swiper(pics, {
                    effect: 'fade',
                    fadeEffect: { crossFade: true },
                    speed: 700,
                    allowTouchMove: false,
                });
            } else {
                picsSwiper = new Swiper(pics, {
                    direction: 'vertical',
                    parallax: true,
                    speed: 900,
                    allowTouchMove: false,
                });
            }

            if (isSplitSliderBlock) {
                const textSlides = Array.from(contents.querySelectorAll('.sg-split-slider-text-slide'));
                const picSlides = Array.from(pics.querySelectorAll('.swiper-slide'));
                let currentIndex = 0;
                let isAnimating = false;
                const prevBtn = item.querySelector('.sg-split-slider-nav-prev-global');
                const nextBtn = item.querySelector('.sg-split-slider-nav-next-global');
                const navWrap = item.querySelector('.sg-split-slider-nav-global');

                if (textSlides.length <= 1) {
                    if (navWrap) navWrap.style.display = 'none';
                }

                const updateBtnStates = () => {
                    if (prevBtn) prevBtn.classList.toggle('is-disabled', currentIndex === 0);
                    if (nextBtn) nextBtn.classList.toggle('is-disabled', currentIndex === textSlides.length - 1);
                };
                const SPLIT_Y = {
                    regularIn: 30,
                    quoteIn: 22,
                    regularOut: 20,
                    quoteOut: 18,
                };
                const getSplitTextY = (el, regularY, quoteY) => (
                    el && el.classList.contains('sg-split-slider-quote') ? quoteY : regularY
                );

                // Set initial state — non-first slides hidden
                textSlides.forEach((slide, i) => {
                    if (i === 0) return;
                    gsap.set(slide.querySelectorAll('.sg-split-slider-anim-item'), {
                        y: (_idx, el) => getSplitTextY(el, SPLIT_Y.regularIn, SPLIT_Y.quoteIn),
                        opacity: 0,
                    });
                });
                updateBtnStates();

                const goToSlide = (index) => {
                    if (isAnimating || index < 0 || index >= textSlides.length || index === currentIndex) return;
                    isAnimating = true;

                    const direction = index > currentIndex ? 1 : -1;
                    const currentSlide = textSlides[currentIndex];
                    const nextSlide = textSlides[index];
                    const currentItems = currentSlide.querySelectorAll('.sg-split-slider-anim-item');
                    const nextItems = nextSlide.querySelectorAll('.sg-split-slider-anim-item');
                    const currentImg = picSlides[currentIndex]?.querySelector('.sg-mask-grow-image');
                    const nextImg = picSlides[index]?.querySelector('.sg-mask-grow-image');

                    picsSwiper.slideTo(index);

                    // Image zoom transition — scale within the fixed clip shape on <g>
                    if (currentImg) {
                        gsap.killTweensOf(currentImg);
                        gsap.to(currentImg, { scale: 0.92, duration: 0.55, ease: 'power2.in', svgOrigin: '320 310' });
                    }
                    if (nextImg) {
                        gsap.killTweensOf(nextImg);
                        gsap.fromTo(nextImg,
                            { scale: 1.12, svgOrigin: '320 310' },
                            { scale: 1.0, duration: 0.95, ease: 'power2.out', svgOrigin: '320 310' }
                        );
                    }

                    gsap.set(nextSlide, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
                    gsap.set(nextItems, {
                        y: (_idx, el) => direction * getSplitTextY(el, SPLIT_Y.regularIn, SPLIT_Y.quoteIn),
                        opacity: 0,
                    });

                    const tl = gsap.timeline({
                        onComplete: () => {
                            currentSlide.classList.remove('is-active');
                            nextSlide.classList.add('is-active');
                            // Reset outgoing image scale for next time it becomes active
                            if (currentImg) gsap.set(currentImg, { scale: 1, svgOrigin: '320 310' });
                            currentIndex = index;
                            isAnimating = false;
                            updateBtnStates();
                        },
                    });

                    tl.to(currentItems, {
                        y: (_idx, el) => direction * -getSplitTextY(el, SPLIT_Y.regularOut, SPLIT_Y.quoteOut),
                        opacity: 0,
                        duration: 0.5,
                        stagger: { each: 0.05, from: direction > 0 ? 'start' : 'end' },
                        ease: 'power3.in',
                    });
                    tl.to(nextItems, { y: 0, opacity: 1, duration: 0.6, stagger: { each: 0.08, from: direction > 0 ? 'start' : 'end' }, ease: 'power3.out' }, '-=0.2');
                    tl.set(currentSlide, { opacity: 0, visibility: 'hidden', pointerEvents: 'none' }, '-=0.4');
                };

                if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
                if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

            } else {
                const contentSwiper = new Swiper(contents, {
                    effect: 'fade',
                    fadeEffect: { crossFade: true },
                    speed: 900,
                    allowTouchMove: false,
                    navigation: {
                        nextEl: item.querySelector('.swiper-button-next'),
                        prevEl: item.querySelector('.swiper-button-prev'),
                    },
                    thumbs: {
                        swiper: picsSwiper,
                    },
                });

                contentSwiper.on('slideChangeTransitionStart', () => {
                    const activeSlide = contentSwiper.slides[contentSwiper.activeIndex];
                    const themeClass = activeSlide ? activeSlide.getAttribute('data-class-theme') : null;
                    if (themeClass) {
                        setTimeout(() => {
                            item.classList.remove('theme-color-1', 'theme-color-2', 'theme-color-3');
                            item.classList.add(themeClass);
                        }, 400);
                    }
                });
            }
        });
    }

    const simpleSliders = document.querySelectorAll('.sg-simple-slider');
    let lastTime = performance.now();
    let lastTranslate = 0;
    let velocity = 0;
    let rafId = null;

    function applyScaleEffect(value, swiper) {
        const maxV = 3.0;
        const minV = 0.01;
        const maxScale = 1;
        const minScale = 0.7;
        const norm = 1 - Math.min(Math.max((value - minV) / (maxV - minV), 0), 1);
        const scaleX = minScale + (maxScale - minScale) * norm;
        swiper.el.querySelectorAll('.swiper-slide .sg-slide-image').forEach((img) => {
            img.style.transform = `scale(${scaleX.toFixed(3)})`;
        });
    }

    function trackVelocity(swiper) {
        const currentTime = performance.now();
        const currentTranslate = swiper.translate;
        const deltaTime = currentTime - lastTime;
        const deltaTranslate = currentTranslate - lastTranslate;
        velocity = Math.abs(deltaTranslate / deltaTime);
        applyScaleEffect(velocity, swiper);
        lastTranslate = currentTranslate;
        lastTime = currentTime;
    }

    function continueTracking(swiper) {
        cancelAnimationFrame(rafId);
        const track = () => {
            trackVelocity(swiper);
            if (velocity > 0.01) {
                rafId = requestAnimationFrame(track);
            }
        };
        rafId = requestAnimationFrame(track);
    }

    function simulateDragTracking(swiper) {
        cancelAnimationFrame(rafId);
        velocity = 2.5;
        const friction = 0.92;
        const fakeTrack = () => {
            applyScaleEffect(velocity, swiper);
            velocity *= friction;
            if (velocity > 0.01) {
                rafId = requestAnimationFrame(fakeTrack);
            }
        };
        rafId = requestAnimationFrame(fakeTrack);
    }

    function stopTracking() {
        cancelAnimationFrame(rafId);
        velocity = 0;
    }

    if (simpleSliders.length) {
        simpleSliders.forEach((item) => {
            const hasParallaxImages = item.querySelectorAll('.swiper-slide .sg-slide-image').length > 0;
            let spaceBetween = 30;
            if (item.classList.contains('sg-simple-slider--secondary') && window.innerWidth > 991) {
                spaceBetween = 40;
            }

            new Swiper(item, {
                speed: 900,
                spaceBetween,
                resistance: false,
                slidesPerView: 'auto',
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                on: {
                    setTranslate(swiper) {
                        if (hasParallaxImages) trackVelocity(swiper);
                    },
                    touchEnd(swiper) {
                        if (hasParallaxImages) continueTracking(swiper);
                    },
                    transitionStart(swiper) {
                        if (hasParallaxImages) simulateDragTracking(swiper);
                    },
                    transitionEnd() {
                        if (hasParallaxImages) stopTracking();
                    },
                },
            });
        });
    }

    // ── History Timeline ──────────────────────────────────
    document.querySelectorAll('[data-history-timeline]').forEach((section) => {
        const timelineEl = section.querySelector('.sg-history-timeline__swiper');
        if (!timelineEl) return;

        const totalSlides = timelineEl.querySelectorAll('.swiper-slide').length;
        const progressFill = section.querySelector('.sg-history-timeline__progress-fill');
        if (!totalSlides) return;

        section.classList.toggle('sg-history-timeline--single', totalSlides <= 1);

        const updateProgress = (swiper) => {
            if (!progressFill) return;
            const idx = swiper && Number.isFinite(swiper.activeIndex) ? swiper.activeIndex : 0;
            progressFill.style.width = `${Math.min(100, ((idx + 1) / totalSlides) * 100)}%`;
        };

        new Swiper(timelineEl, {
            slidesPerView: 'auto',
            centeredSlides: true,
            spaceBetween: 28,
            speed: 650,
            grabCursor: totalSlides > 1,
            slideToClickedSlide: true,
            watchSlidesProgress: true,
            observer: true,
            observeParents: true,
            navigation: {
                prevEl: section.querySelector('.sg-history-timeline__nav-btn--prev'),
                nextEl: section.querySelector('.sg-history-timeline__nav-btn--next'),
            },
            breakpoints: {
                0: { spaceBetween: 20 },
                768: { spaceBetween: 28 },
                1200: { spaceBetween: 32 },
            },
            on: {
                init(swiper) { updateProgress(swiper); },
                slideChange(swiper) { updateProgress(swiper); },
                resize(swiper) { updateProgress(swiper); },
            },
        });
    });

}

// ── Staff Quotes Slider ───────────────────────────────────
(function () {
    var section = document.querySelector('.sg-staff-quotes-slider');
    if (!section || typeof gsap === 'undefined') return;

    var slides = Array.from(section.querySelectorAll('.sg-staff-quotes-slider__slide'));
    var prevBtn = section.querySelector('.sg-staff-quotes-prev');
    var nextBtn = section.querySelector('.sg-staff-quotes-next');
    var total = slides.length;
    var current = 0;
    var animating = false;
    var IN_Y = 28;
    var OUT_Y = 18;

    function updateBtnStates() {
        if (prevBtn) prevBtn.classList.toggle('is-disabled', current === 0);
        if (nextBtn) nextBtn.classList.toggle('is-disabled', current === total - 1);
    }

    // Hide items of non-first slides only — first slide entrance handled by sg-anim-item--static
    slides.forEach(function (slide, i) {
        if (i === 0) return;
        gsap.set(slide.querySelectorAll('.sq-anim-item'), { y: IN_Y, opacity: 0 });
    });
    updateBtnStates();

    function goToSlide(index) {
        if (animating || index === current || index < 0 || index >= total) return;
        animating = true;

        var direction = index > current ? 1 : -1;
        var prevItems = slides[current].querySelectorAll('.sq-anim-item');
        var nextItems = slides[index].querySelectorAll('.sq-anim-item');

        gsap.set(nextItems, { y: direction * IN_Y, opacity: 0 });

        gsap.timeline({
            onComplete: function () {
                current = index;
                animating = false;
                updateBtnStates();
            },
        })
            .to(prevItems, { y: direction * -OUT_Y, opacity: 0, duration: 0.45, stagger: { each: 0.05, from: direction > 0 ? 'start' : 'end' }, ease: 'power3.in' }, 0)
            .to(nextItems, { y: 0, opacity: 1, duration: 0.55, stagger: { each: 0.07, from: direction > 0 ? 'start' : 'end' }, ease: 'power3.out' }, '-=0.25');
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(current + 1); });
}());

// ── History Video Player ──────────────────────────────────
document.querySelectorAll('.sg-history-video').forEach((wrap) => {
    const video = wrap.querySelector('.sg-history-video__player');
    const playBtn = wrap.querySelector('.sg-history-video__play-btn');
    if (!video || !playBtn) return;
    let playing = false;

    wrap.addEventListener('mouseenter', () => {
        if (playing) return;
        video.muted = true;
        video.play().catch(() => {});
        wrap.classList.add('sg-history-video--previewing');
    });

    wrap.addEventListener('mouseleave', () => {
        if (playing) return;
        video.pause();
        video.currentTime = 0;
        wrap.classList.remove('sg-history-video--previewing');
    });

    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playing = true;
        video.muted = false;
        video.currentTime = 0;
        video.controls = true;
        video.play();
        wrap.classList.remove('sg-history-video--previewing');
        wrap.classList.add('sg-history-video--playing');
    });

    video.addEventListener('ended', () => {
        playing = false;
        video.controls = false;
        video.muted = true;
        video.currentTime = 0;
        wrap.classList.remove('sg-history-video--playing');
    });
});

initAppSwipers();

const clearInitialLoadingState = () => {
    document.documentElement.classList.remove('js-loading');
};

if (window.SGAnimations) {
    const initAnimationsAndReveal = () => {
        try {
            window.SGAnimations.init();
        } finally {
            // Remove loading guard only after initial GSAP states are applied.
            requestAnimationFrame(clearInitialLoadingState);
        }
    };

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(initAnimationsAndReveal).catch(initAnimationsAndReveal);
    } else {
        initAnimationsAndReveal();
    }
} else {
    clearInitialLoadingState();
}


function getCurrentPageScrollTop() {
    if (bodyScrollBar) {
        return bodyScrollBar.scrollTop || bodyScrollBar.offset?.y || 0;
    }

    if (lenis && typeof lenis.scroll === 'number') {
        return lenis.scroll;
    }

    return window.pageYOffset || document.documentElement.scrollTop || 0;
}

function setCurrentPageScrollTop(value) {
    var nextValue = Math.max(0, value);

    if (bodyScrollBar) {
        bodyScrollBar.scrollTop = nextValue;
        return;
    }

    if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(nextValue, { immediate: true });
        return;
    }

    window.scrollTo(0, nextValue);
}

var activeAccordionAnchorKeeper = null;

function keepAccordionTriggerAnchored(trigger) {
    if (!trigger || typeof gsap === 'undefined') return;

    if (activeAccordionAnchorKeeper) {
        gsap.ticker.remove(activeAccordionAnchorKeeper);
        activeAccordionAnchorKeeper = null;
    }

    var initialTop = trigger.getBoundingClientRect().top;
    var startTime = performance.now();
    var maxDuration = 420;

    activeAccordionAnchorKeeper = function() {
        var currentTop = trigger.getBoundingClientRect().top;
        var delta = currentTop - initialTop;

        if (Math.abs(delta) > 0.5) {
            setCurrentPageScrollTop(getCurrentPageScrollTop() + delta);
        }

        if (performance.now() - startTime > maxDuration) {
            gsap.ticker.remove(activeAccordionAnchorKeeper);
            activeAccordionAnchorKeeper = null;
        }
    };

    gsap.ticker.add(activeAccordionAnchorKeeper);
}

document.querySelectorAll('.sg-accordion-list').forEach(function(list) {
    var items = list.querySelectorAll('.sg-accordion-item');
    if (!items.length || typeof gsap === 'undefined') return;

    var DUR = 0.42;
    var EASE = 'power3.inOut';
    var activeEntry = null;
    var entries = [];

    function closeEntry(entry) {
        var h = entry.body.getBoundingClientRect().height;
        entry.item.classList.remove('is-open');
        entry.trigger.setAttribute('aria-expanded', 'false');
        gsap.to(entry.body, { height: 0, duration: DUR, ease: EASE, overwrite: true });
        if (entry.icon) gsap.to(entry.icon, { rotation: 0, duration: DUR, ease: EASE, overwrite: true });
    }

    function openEntry(entry) {
        // Measure natural height without flicker
        gsap.set(entry.body, { height: 'auto' });
        var targetH = entry.body.scrollHeight;
        gsap.set(entry.body, { height: 0 });

        entry.item.classList.add('is-open');
        entry.trigger.setAttribute('aria-expanded', 'true');
        gsap.to(entry.body, {
            height: targetH,
            duration: DUR,
            ease: EASE,
            overwrite: true,
            onComplete: function() { gsap.set(entry.body, { height: 'auto' }); }
        });
        if (entry.icon) gsap.to(entry.icon, { rotation: 180, duration: DUR, ease: EASE, overwrite: true });
    }

    items.forEach(function(item) {
        var trigger = item.querySelector('.sg-accordion-trigger');
        var body = item.querySelector('.sg-accordion-body');
        var icon = item.querySelector('.sg-accordion-icon');
        if (!trigger || !body) return;

        body.style.overflow = 'hidden';

        var isOpen = item.classList.contains('is-open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        if (!isOpen) {
            gsap.set(body, { height: 0 });
        } else {
            gsap.set(icon, { rotation: 180 });
        }

        var entry = { item: item, trigger: trigger, body: body, icon: icon };
        entries.push(entry);
        if (isOpen) activeEntry = entry;
    });

    entries.forEach(function(entry) {
        entry.trigger.addEventListener('click', function() {
            var isOpen = entry.item.classList.contains('is-open');

            entries.forEach(function(other) {
                if (other !== entry && other.item.classList.contains('is-open')) {
                    closeEntry(other);
                }
            });

            if (isOpen) {
                closeEntry(entry);
                activeEntry = null;
            } else {
                openEntry(entry);
                activeEntry = entry;
            }
        });
    });
});

// ── News Browse: Isotope filter + load more ───────────────────
(function () {
    const grid = document.getElementById('sg-news-grid');
    if (!grid) return;

    // ── Configure here ────────────────────────────────────────
    const configuredInitialCount = parseInt(grid.dataset.initialCount, 10);
    const configuredLoadMoreCount = parseInt(grid.dataset.loadMoreCount, 10);
    const INITIAL_COUNT = Number.isFinite(configuredInitialCount) && configuredInitialCount > 0 ? configuredInitialCount : 12;  // items visible on page load
    const LOAD_MORE_COUNT = Number.isFinite(configuredLoadMoreCount) && configuredLoadMoreCount > 0 ? configuredLoadMoreCount : 6; // items revealed per "Load More" click
    // ─────────────────────────────────────────────────────────

    let currentFilter = '*';
    let iso = null;
    const usesCardFade = grid.dataset.cardAnimation === 'fade';
    var loadMoreBtn = document.getElementById('sg-news-load-more');

    function refreshNewsCardAnimations() {
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                if (window.SGAnimations && typeof window.SGAnimations.initCardFadeReveal === 'function') {
                    window.SGAnimations.initCardFadeReveal();
                }
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh(true);
                }
            });
        });
    }

    function itemMatchesFilter(item, filter) {
        return filter === '*' || filter === '' || item.matches(filter);
    }

    function getItemsForFilter(filter) {
        return Array.from(grid.querySelectorAll('.sg-news-item')).filter(function (item) {
            return itemMatchesFilter(item, filter);
        });
    }

    function getPendingItemsForFilter(filter) {
        return getItemsForFilter(filter).filter(function (item) {
            return item.classList.contains('sg-news-item--pending');
        });
    }

    function updateLoadMoreVisibility() {
        if (!loadMoreBtn) return;
        loadMoreBtn.classList.toggle('sg-hidden', getPendingItemsForFilter(currentFilter).length === 0);
    }

    function prepareItemForReveal(item, animate) {
        item.classList.remove('sg-news-item--pending');
        if (!animate) return;

        if (usesCardFade) {
            var card = item.querySelector('.sg-news-card');
            if (card && card.dataset.cardFadeReady !== 'true') {
                card.style.opacity = '0';
                card.style.visibility = 'hidden';
            }
        } else {
            item.style.opacity = '0';
        }
    }

    function revealItems(items, animate) {
        items.forEach(function (item) {
            prepareItemForReveal(item, animate);
        });
        return items;
    }

    function revealInitialItemsForFilter(filter) {
        var matchingItems = getItemsForFilter(filter);
        var visibleMatchingItems = matchingItems.filter(function (item) {
            return !item.classList.contains('sg-news-item--pending');
        });
        var revealCount = Math.max(0, INITIAL_COUNT - visibleMatchingItems.length);
        if (!revealCount) return [];

        return revealItems(getPendingItemsForFilter(filter).slice(0, revealCount), true);
    }

    function rebuildIso(filter) {
        if (typeof Isotope === 'undefined') return;
        if (iso) iso.destroy();
        iso = new Isotope(grid, {
            itemSelector: '.sg-news-item:not(.sg-news-item--pending)',
            layoutMode: 'fitRows',
            percentPosition: true,
            transitionDuration: '0.35s',
            filter: filter === '*' ? '' : filter,
        });
        updateLoadMoreVisibility();
        refreshNewsCardAnimations();
    }

    // Reveal the first INITIAL_COUNT items immediately
    const allPending = Array.from(grid.querySelectorAll('.sg-news-item--pending'));
    revealItems(allPending.slice(0, INITIAL_COUNT), false);

    function initIso() {
        if (typeof Isotope === 'undefined') return;
        rebuildIso(currentFilter);
    }

    // Filter buttons
    const filterBtns = Array.from(document.querySelectorAll('.sg-news-filter-btn'));
    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!iso) return;
            filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
            btn.classList.add('is-active');
            currentFilter = btn.dataset.filter || '*';
            revealInitialItemsForFilter(currentFilter);
            rebuildIso(currentFilter);
        });
    });

    // Load more
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            if (!iso) return;

            var pending = getPendingItemsForFilter(currentFilter).slice(0, LOAD_MORE_COUNT);
            if (!pending.length) return;

            // Reveal items; latest-news can opt into card-level fade animation.
            revealItems(pending, true);

            // Re-init isotope so it picks up the newly visible items
            rebuildIso(currentFilter);

            // Fade new items in after Isotope positions them
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    if (usesCardFade) {
                        return;
                    }

                    pending.forEach(function (item) {
                        item.style.transition = 'opacity 0.4s ease';
                        item.style.opacity = '1';
                    });
                    setTimeout(function () {
                        pending.forEach(function (item) {
                            item.style.transition = '';
                            item.style.opacity = '';
                        });
                    }, 450);
                });
            });
        });
    }

    // Init after page scripts are ready
    if (typeof Isotope !== 'undefined') {
        initIso();
    } else {
        window.addEventListener('load', initIso);
    }
})();
document.body.classList.add('scripts-loaded');
