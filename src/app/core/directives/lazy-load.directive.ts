import {
    Directive,
    ElementRef,
    Input,
    OnInit,
    Renderer2,
} from '@angular/core';

/**
 * Directive for lazy loading images
 * Usage: <img appLazyLoad [lazyImage]="imageUrl" [placeholder]="placeholderUrl">
 */
@Directive({
    selector: '[appLazyLoad]',
    standalone: true,
})
export class LazyLoadDirective implements OnInit {
    @Input() lazyImage: string = '';
    @Input() placeholder: string =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E';
    @Input() errorImage: string = '';

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) { }

    ngOnInit(): void {
        this.setupLazyLoad();
    }

    private setupLazyLoad(): void {
        const img = this.el.nativeElement as HTMLImageElement;

        // Set initial placeholder
        if (this.placeholder) {
            this.renderer.setAttribute(img, 'src', this.placeholder);
        }

        if (!this.lazyImage) {
            return;
        }

        // Use Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            const imageToLoad = this.lazyImage;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        this.loadImage(img, imageToLoad);
                        observer.unobserve(img);
                    }
                });
            });

            observer.observe(img);
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadImage(img, this.lazyImage);
        }
    }

    private loadImage(img: HTMLImageElement, src: string): void {
        const imageLoader = new Image();

        imageLoader.onload = () => {
            this.renderer.setAttribute(img, 'src', src);
            this.renderer.addClass(img, 'lazy-loaded');
        };

        imageLoader.onerror = () => {
            if (this.errorImage) {
                this.renderer.setAttribute(img, 'src', this.errorImage);
            }
            this.renderer.addClass(img, 'lazy-error');
        };

        imageLoader.src = src;
    }
}
