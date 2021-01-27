function testWebP(callback) {
	var webP = new Image();
	webP.onload = webP.onerror = function () {
		callback(webP.height == 2);
	};
	webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}
testWebP(function (support) {
	if (support == true) {
		document.querySelector('body').classList.add('_webp');
	} else {
		document.querySelector('body').classList.add('_no-webp');
	}
});
let sections = document.querySelectorAll('._scr-item');
let links = document.querySelectorAll('._goto-block');

let blocks = [];

for (let i = 0; i < links.length; i++) {
   let el = links[i];
   let block_name = el.getAttribute('href').replace('#', '');
   if (block_name != '' && !~blocks.indexOf(block_name)) {
      blocks.push(block_name);
   }

   el.addEventListener('click', function (e) {
      e.preventDefault();

      if (document.querySelector('.menu__body._active')) {
         menu_close();
         body_lock_remove(500);
      }

      let target_block_class = el.getAttribute('href').replace('#', '');
      let target_block = document.querySelector('.' + target_block_class);

      const y = target_block.getBoundingClientRect().top + window.pageYOffset - 50;

      window.scrollTo({
         top: y,
         behavior: 'smooth'
      });
      // target_block.scrollIntoView({
      //    behavior: 'smooth',
      //    block: 'start'
      // })
   });
};

window.addEventListener('scroll', function () {

   let scrollValue = pageYOffset;

   let header = document.querySelector('header.header');
   if (header !== null) {
      if (scrollValue > 1) {
         setTimeout(function () {
            header.classList.add('_scroll');
         }, 300);
      } else {
         setTimeout(function () {
            header.classList.remove('_scroll');
         }, 300);
      }
   }


   let old_current_link = document.querySelectorAll('._goto-block._active');
   if (old_current_link) {
      for (let i = 0; i < old_current_link.length; i++) {
         let el = old_current_link[i];
         el.classList.remove('_active');
      }
   }

   for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];
      let block_item = document.querySelector('.' + block);
      if (block_item) {
         let block_offset = offset(block_item).top;
         let block_height = block_item.offsetHeight;
         if ((pageYOffset > block_offset - window.innerHeight / 3) && pageYOffset < (block_offset + block_height) - window.innerHeight / 3) {
            let current_links = document.querySelectorAll('._goto-block[href="#' + block + '"]');
            for (let i = 0; i < current_links.length; i++) {
               let current_link = current_links[i];
               current_link.classList.add('_active');
            }
         }
      }
   }

});


function menu_close() {
   let iconMenu = document.querySelector(".icon-menu");
   let menuBody = document.querySelector(".menu__body");
   iconMenu.classList.remove("_active");
   menuBody.classList.remove("_active");
}


function offset(el) {
   let rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
   return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft
   }
}
// Dynamic Adapt v.1
// HTML data-da="where(uniq class name),when(breakpoint),position(digi),type (min, max)"
// e.x. data-da="item,767,last,max"
// Andrikanych Yevhen 2020
// https://www.youtube.com/c/freelancerlifestyle

class DynamicAdapt {
	// массив объектов
	elementsArray = [];
	daClassname = '_dynamic_adapt_';

	constructor(type) {
		this.type = type;
	}

	init() {
		// массив DOM-элементов
		this.elements = [...document.querySelectorAll('[data-da]')];

		// наполнение elementsArray объктами
		this.elements.forEach((element) => {
			const data = element.dataset.da.trim();
			if (data !== '') {
				const dataArray = data.split(',');

				const oElement = {};
				oElement.element = element;
				oElement.parent = element.parentNode;
				oElement.destination = document.querySelector(`.${dataArray[0].trim()}`);
				oElement.breakpoint = dataArray[1] ? dataArray[1].trim() : '767';
				oElement.place = dataArray[2] ? dataArray[2].trim() : 'last';

				oElement.index = this.indexInParent(
					oElement.parent, oElement.element,
				);

				this.elementsArray.push(oElement);
			}
		});

		this.arraySort(this.elementsArray);

		// массив уникальных медиа-запросов
		this.mediaArray = this.elementsArray
			.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint}px),${breakpoint}`)
			.filter((item, index, self) => self.indexOf(item) === index);

		// навешивание слушателя на медиа-запрос
		// и вызов обработчика при первом запуске
		this.mediaArray.forEach((media) => {
			const mediaSplit = media.split(',');
			const mediaQuerie = window.matchMedia(mediaSplit[0]);
			const mediaBreakpoint = mediaSplit[1];

			// массив объектов с подходящим брейкпоинтом
			const elementsFilter = this.elementsArray.filter(
				({ breakpoint }) => breakpoint === mediaBreakpoint
			);
			mediaQuerie.addEventListener('change', () => {
				this.mediaHandler(mediaQuerie, elementsFilter);
			});
			this.mediaHandler(mediaQuerie, elementsFilter);
		});
	}

	// Основная функция
	mediaHandler(mediaQuerie, elementsFilter) {
		if (mediaQuerie.matches) {
			elementsFilter.forEach((oElement) => {
				// получение индекса внутри родителя
				oElement.index = this.indexInParent(
					oElement.parent, oElement.element,
				);
				this.moveTo(oElement.place, oElement.element, oElement.destination);
			});
		} else {
			elementsFilter.forEach(({ parent, element, index }) => {
				if (element.classList.contains(this.daClassname)) {
					this.moveBack(parent, element, index);
				}
			});
		}
	}

	// Функция перемещения
	moveTo(place, element, destination) {
		element.classList.add(this.daClassname);
		if (place === 'last' || place >= destination.children.length) {
			destination.append(element);
			return;
		}
		if (place === 'first') {
			destination.prepend(element);
			return;
		}
		destination.children[place].before(element);
	}

	// Функция возврата
	moveBack(parent, element, index) {
		element.classList.remove(this.daClassname);
		if (parent.children[index] !== undefined) {
			parent.children[index].before(element);
		} else {
			parent.append(element);
		}
	}

	// Функция получения индекса внутри родителя
	indexInParent(parent, element) {
		return [...parent.children].indexOf(element);
	}

	// Функция сортировки массива по breakpoint и place 
	// по возрастанию для this.type = min
	// по убыванию для this.type = max
	arraySort(arr) {
		if (this.type === 'min') {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) {
						return 0;
					}
					if (a.place === 'first' || b.place === 'last') {
						return -1;
					}
					if (a.place === 'last' || b.place === 'first') {
						return 1;
					}
					return a.place - b.place;
				}
				return a.breakpoint - b.breakpoint;
			});
		} else {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) {
						return 0;
					}
					if (a.place === 'first' || b.place === 'last') {
						return 1;
					}
					if (a.place === 'last' || b.place === 'first') {
						return -1;
					}
					return b.place - a.place;
				}
				return b.breakpoint - a.breakpoint;
			});
			return;
		}
	}
}

const da = new DynamicAdapt('max');
da.init();
let ua = window.navigator.userAgent;
let msie = ua.indexOf("MSIE ");
let isMobile = {
   Android: function () {
      return navigator.userAgent.match(/Android/i);
   },
   BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
   },
   iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
   },
   Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
   },
   Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
   },
   any: function () {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
   }
};

function isIE() {
   ua = navigator.userAgent;
   var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
   return is_ie;
}
if (isIE()) {
   document.querySelector('body').classList.add('ie');
}
if (isMobile.any()) {
   document.querySelector('body').classList.add('_touch');
}

function testWebP(callback) {
   var webP = new Image();
   webP.onload = webP.onerror = function () {
      callback(webP.height == 2);
   };
   webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}
testWebP(function (support) {
   if (support == true) {
      document.querySelector('body').classList.add('_webp');
   } else {
      document.querySelector('body').classList.add('_no-webp');
   }
});


if (document.querySelector('.wrapper')) {
   document.querySelector('.wrapper').classList.add('_loaded');
}

let unlock = true;

//=================
//SlideToggle
let _slideUp = (target, duration = 500) => {
   target.style.transitionProperty = 'height, margin, padding';
   target.style.transitionDuration = duration + 'ms';
   target.style.height = target.offsetHeight + 'px';
   target.offsetHeight;
   target.style.overflow = 'hidden';
   target.style.height = 0;
   target.style.paddingTop = 0;
   target.style.paddingBottom = 0;
   target.style.marginTop = 0;
   target.style.marginBottom = 0;
   window.setTimeout(() => {
      target.style.display = 'none';
      target.style.removeProperty('height');
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
      target.classList.remove('_slide');
   }, duration);
}
let _slideDown = (target, duration = 500) => {
   target.style.removeProperty('display');
   let display = window.getComputedStyle(target).display;
   if (display === 'none')
      display = 'block';

   target.style.display = display;
   let height = target.offsetHeight;
   target.style.overflow = 'hidden';
   target.style.height = 0;
   target.style.paddingTop = 0;
   target.style.paddingBottom = 0;
   target.style.marginTop = 0;
   target.style.marginBottom = 0;
   target.offsetHeight;
   target.style.transitionProperty = "height, margin, padding";
   target.style.transitionDuration = duration + 'ms';
   target.style.height = height + 'px';
   target.style.removeProperty('padding-top');
   target.style.removeProperty('padding-bottom');
   target.style.removeProperty('margin-top');
   target.style.removeProperty('margin-bottom');
   window.setTimeout(() => {
      target.style.removeProperty('height');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
      target.classList.remove('_slide');
   }, duration);
}
let _slideToggle = (target, duration = 500) => {
   if (!target.classList.contains('_slide')) {
      target.classList.add('_slide');
      if (window.getComputedStyle(target).display === 'none') {
         return _slideDown(target, duration);
      } else {
         return _slideUp(target, duration);
      }
   }
}

//=================

//Menu
let iconMenu = document.querySelector(".icon-menu");
if (iconMenu != null) {
   let delay = 500;
   let menuBody = document.querySelector(".menu__body");
   iconMenu.addEventListener("click", function (e) {
      if (unlock) {
         body_lock(delay);
         iconMenu.classList.toggle("_active");
         menuBody.classList.toggle("_active");
      }
   });
};

function menu_close() {
   let iconMenu = document.querySelector(".icon-menu");
   let menuBody = document.querySelector(".menu__body");
   iconMenu.classList.remove("_active");
   menuBody.classList.remove("_active");
}
//=================

//BodyLock

function body_lock(delay) {
   let body = document.querySelector("body");
   if (body.classList.contains('_lock')) {
      body_lock_remove(delay);
   } else {
      body_lock_add(delay);
   }
}

function body_lock_remove(delay) {
   let body = document.querySelector("body");
   if (unlock) {
      let lock_padding = document.querySelectorAll("._lp");
      setTimeout(() => {
         for (let index = 0; index < lock_padding.length; index++) {
            const el = lock_padding[index];
            el.style.paddingRight = '0px';
         }
         body.style.paddingRight = '0px';
         body.classList.remove("_lock");
      }, delay);

      unlock = false;
      setTimeout(function () {
         unlock = true;
      }, delay);
   }
}

function body_lock_add(delay) {
   let body = document.querySelector("body");
   if (unlock) {
      let lock_padding = document.querySelectorAll("._lp");
      for (let index = 0; index < lock_padding.length; index++) {
         const el = lock_padding[index];
         el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
      }
      body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
      body.classList.add("_lock");

      unlock = false;
      setTimeout(function () {
         unlock = true;
      }, delay);
   }
}


// email validation

let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

let formSubcribe = document.querySelector('.form-subcribe');
let btnSubcribe = formSubcribe.querySelector('.form-subcribe__button');
let errorMessageEmail = formSubcribe.querySelector('.error-message_email');
let fieldEmail = formSubcribe.querySelector('#input_mail');

btnSubcribe.addEventListener("click", function (e) {
   e.preventDefault();
   if (fieldEmail.value == "") {
      errorMessageEmail.classList.add('_show');
   } else {
      if (fieldEmail.value != "") {
         let emailAddress = fieldEmail.value;
         if (reg.test(emailAddress) == false) {
            errorMessageEmail.classList.add('_show');
         } else {
            errorMessageEmail.classList.remove('_show');
         }
      }
   }
});


// Video

let videoBtn = document.querySelector('.video-about__btn');
let itemVideo = videoBtn.parentElement;
let bodyParent = itemVideo.parentElement;
let closeBtn = bodyParent.querySelector('.video-about__close');
let video = itemVideo.querySelector('video');

if (bodyParent) {

   videoBtn.addEventListener('click', function (e) {
      e.preventDefault();

      if (window.innerWidth < 715) {
         itemVideo.classList.add('_small-window');
      }

      setTimeout(function () {
         itemVideo.classList.add('_hide');
         videoBtn.classList.add('_hide');
         closeBtn.classList.add('_show');
      }, 300);
      video.play();
   });

   closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      video.pause();

      setTimeout(function () {
         itemVideo.classList.remove('_small-window');
         itemVideo.classList.remove('_hide');
         videoBtn.classList.remove('_hide');
         closeBtn.classList.remove('_show');
      }, 300);
   });
}


// Footer spollers

let footerSpollers = document.querySelectorAll('.footer__row');
let footerTitle = document.querySelectorAll('.menu-footer__title');
let footerNav = document.querySelectorAll('.menu-footer__nav');

if (window.innerWidth <= 625) {

   if (footerSpollers.length > 0) {
      for (let i = 0; i < footerSpollers.length; i++) {
         footerSpollers[i].classList.add('_spollers');
         footerSpollers[i].classList.add('_one');
      }
   }

   for (let i = 0; i < footerTitle.length; i++) {
      footerTitle[i].classList.add('_spoller');
   }

   for (let i = 0; i < footerNav.length; i++) {
      footerNav[i].style.display = 'none';
   }

   let spollers = document.querySelectorAll("._spoller");
   let spollersGo = true;

   if (spollers.length > 0) {
      for (let index = 0; index < spollers.length; index++) {
         const spoller = spollers[index];
         spoller.addEventListener("click", function (e) {
            if (spollersGo) {
               spollersGo = false;
               if (spoller.closest('._spollers').classList.contains('_one')) {
                  let curent_spollers = spoller.closest('._spollers').querySelectorAll('._spoller');
                  for (let i = 0; i < curent_spollers.length; i++) {
                     let el = curent_spollers[i];
                     if (el != spoller) {
                        el.classList.remove('_active');
                        _slideUp(el.nextElementSibling);
                     }
                  }
               }
               spoller.classList.toggle('_active');
               _slideToggle(spoller.nextElementSibling);

               setTimeout(function () {
                  spollersGo = true;
               }, 500);
            }
         });
         if (spoller.classList.contains('_active')) {
            _slideToggle(spoller.nextElementSibling);
         }
      }
   }
}


/* -----------------------AOS js -------------------- */
/* https://github.com/michalsnik/aos */

AOS.init({
   disable: 'mobile', // accepts following values: false, 'tablet', 'phone', boolean, expression or function
   // disable: function () {
   //    var maxWidth = 800;
   //    return window.innerWidth < maxWidth;
   // },
   startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
   initClassName: 'aos-init', // class applied after initialization
   animatedClassName: 'aos-animate', // class applied on animation
   useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
   disableMutationObserver: false, // disables automatic mutations' detections (advanced)
   debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
   throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)

   // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
   offset: 80, // offset (in px) from the original trigger point
   delay: 0, // values from 0 to 3000, with step 50ms
   duration: 800, // values from 0 to 3000, with step 50ms
   easing: 'ease', // default easing for AOS animations
   once: false, // whether animation should happen only once - while scrolling down
   mirror: false, // whether elements should animate out while scrolling past them
   anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation
});

window.onresize = function () {
   AOS.refresh();
}
