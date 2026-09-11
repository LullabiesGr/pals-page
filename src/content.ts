export type DocSection = {
  id: string;
  title: string;
  body?: string[];
  bullets?: string[];
  note?: { type: 'tip' | 'warning' | 'info'; text: string };
};

export type DocPage = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  keywords: string[];
  sections: DocSection[];
};

export const docs: DocPage[] = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    eyebrow: 'SETUP',
    intro: 'Install PALS, connect your Shopify resources and prepare the storefront for launch.',
    keywords: ['install', 'zip', 'publish', 'preset', 'navigation', 'images', 'backup'],
    sections: [
      {
        id: 'install',
        title: 'Install the theme',
        body: ['In Shopify admin, open Online Store → Themes, choose Add theme → Upload zip file, then select the PALS ZIP. Keep your current live theme published while setup is in progress.'],
        bullets: ['Use the PALS preset when creating the first theme configuration.', 'Preview the unpublished theme before publishing.', 'Duplicate the configured theme before large design changes.']
      },
      {
        id: 'navigation',
        title: 'Connect navigation and content',
        body: ['Create the main and footer menus under Content → Menus, then select those menus in the Header and Footer settings. PALS sections use native Shopify product, collection, page, blog and menu pickers.'],
        note: { type: 'warning', text: 'Do not paste product URLs into settings when a native product or collection picker is available. Native resources remain portable between stores.' }
      },
      {
        id: 'media',
        title: 'Prepare images',
        bullets: ['Product images: square files at least 1600 × 1600 px.', 'Editorial images: WebP or JPEG with a defined focal point.', 'Uploaded pet visuals: transparent PNG or WebP with empty space around paws and tail.', 'Add useful alt text in Shopify admin; do not repeat the product title mechanically.']
      },
      {
        id: 'launch',
        title: 'Pre-launch check',
        bullets: ['Test navigation, search, variants, sold-out states and checkout.', 'Check homepage, product, collection and cart on mobile and desktop.', 'Confirm policy pages, contact details, shipping information and payment methods.', 'Run a test order before publishing.']
      }
    ]
  },
  {
    slug: 'theme-settings',
    title: 'Theme settings',
    eyebrow: 'DESIGN SYSTEM',
    intro: 'Control the shared colors, typography, card styling, motion and playful details from one place.',
    keywords: ['colors', 'typography', 'buttons', 'hover', 'shadow', 'motion', 'back to top'],
    sections: [
      {
        id: 'global-style',
        title: 'Global style',
        body: ['Open Theme settings to set the base background, text, accent and border colors. Choose readable combinations before adjusting individual sections.'],
        bullets: ['Use dark text on yellow, cream, pink and lime.', 'Keep blue surfaces paired with white or cream text.', 'Use the global border width and radius to keep cards consistent.']
      },
      {
        id: 'card-effects',
        title: 'Card hover effects',
        body: ['Product sections can use lift, tilt, scale, outline, color-shift or offset-shadow effects. The shadow corner setting can be square, rounded or matched to the product-card radius.'],
        note: { type: 'tip', text: 'Use one dominant hover effect across the store. Combining strong tilt, scale and shadow effects reduces visual clarity.' }
      },
      {
        id: 'playful-overlays',
        title: 'Playful overlays',
        body: ['The global overlay controls enable or disable optional paws, bones, fishbones, stickers and pet details. Section-level controls determine where they appear.'],
        bullets: ['Choose Cat, Dog or Mixed visual style.', 'Set motion to Off, Gentle or Playful.', 'Disable overlays for a cleaner editorial presentation.']
      },
      {
        id: 'back-to-top',
        title: 'Back-to-top button',
        body: ['Enable the button globally and choose Paw, Bone, Fishbone or Arrow. Verify that its position does not cover the chat widget, cookie banner or cart controls.']
      }
    ]
  },
  {
    slug: 'header',
    title: 'Header and navigation',
    eyebrow: 'HEADER',
    intro: 'Configure navigation, announcements, the cart badge and the optional perched pet visual.',
    keywords: ['logo', 'menu', 'announcement', 'sticky', 'cart counter', 'cat', 'dog', 'transparent'],
    sections: [
      {
        id: 'identity',
        title: 'Logo and menu',
        body: ['Upload a logo or use the text logo. Select the primary Shopify menu and confirm every item resolves to a valid resource.'],
        bullets: ['Provide a compact logo variant for mobile.', 'Avoid logo files with large transparent margins.', 'Keep the first-level navigation concise.']
      },
      {
        id: 'announcement',
        title: 'Announcement and separator',
        body: ['The announcement can be static or scrolling. The separator below the header can be hidden or displayed as a solid line, dashed line, diagonal pattern, wave or animal-detail trail.'],
        note: { type: 'info', text: 'Scrolling announcements pause for reduced-motion users and must not contain information that is unavailable elsewhere.' }
      },
      {
        id: 'header-pet',
        title: 'Header pet',
        body: ['Enable the built-in cat or dog, or select Uploaded visual to use a transparent image of any animal. Adjust desktop and mobile size, horizontal position, vertical position and tail overlap independently.'],
        bullets: ['Use transparent PNG or WebP.', 'Keep the animal away from search, account, cart and menu controls.', 'Use the mobile visibility switch when the available header width is limited.']
      },
      {
        id: 'cart-badge',
        title: 'Cart badge',
        body: ['Choose a standard circle or paw badge. Separate desktop and mobile offsets position the counter without covering the doghouse cart icon.']
      }
    ]
  },
  {
    slug: 'product-cards',
    title: 'Product cards',
    eyebrow: 'MERCHANDISING',
    intro: 'Build clickable, merchant-controlled cards from real Shopify products and collections.',
    keywords: ['product', 'collection', 'second image', 'quick buy', 'badges', 'corner paws'],
    sections: [
      {
        id: 'resources',
        title: 'Use Shopify resources',
        body: ['Select a collection for collection-driven grids or select individual products where manual curation is required. The title, price, availability, URL and media come directly from Shopify.'],
        note: { type: 'warning', text: 'Image-only cards are decorative. Use product or collection selectors when visitors need to open a product or collection.' }
      },
      {
        id: 'media',
        title: 'Product media',
        body: ['Enable second image on hover to reveal the second product media item. On touch devices the primary image remains stable. Cards without a second image fall back cleanly.']
      },
      {
        id: 'commerce',
        title: 'Commerce controls',
        bullets: ['Quick buy adds the available default variant directly to cart.', 'Products requiring option selection open the product page.', 'Sale and sold-out badges use actual Shopify product state.', 'The entire card title and media area link to the canonical product URL.']
      },
      {
        id: 'pet-details',
        title: 'Corner pet details',
        body: ['Enable corner paws and choose Cat or Dog. Appearance options include Paws only, Face only, Paws and tail or Full character. Uploaded transparent visuals are available for custom animals.'],
        note: { type: 'tip', text: 'Decorative pet details are optional and do not replace product information or accessible labels.' }
      }
    ]
  },
  {
    slug: 'cart-drawer',
    title: 'Cart drawer',
    eyebrow: 'CART',
    intro: 'Configure a fast slide-out cart with live quantities, upsells and a playful shipping-progress treatment.',
    keywords: ['drawer', 'quantity', 'remove', 'upsell', 'shipping', 'bone', 'fishbone', 'discount'],
    sections: [
      {
        id: 'enable',
        title: 'Enable the drawer',
        body: ['In Theme settings → Cart, select Cart drawer. Test opening the drawer from the header, quick buy and product form. Quantity and removal controls update the server cart without a page reload.']
      },
      {
        id: 'progress',
        title: 'Shipping progress',
        body: ['Enter the free-shipping threshold in the store currency and choose Standard, Bone or Fishbone. The progress value is based on the current cart subtotal.'],
        note: { type: 'warning', text: 'The progress bar communicates a threshold; it does not create a shipping rate. Configure the matching free-shipping rule in Shopify admin.' }
      },
      {
        id: 'upsells',
        title: 'Cart upsells',
        body: ['Select products or a collection for cart recommendations. Products already in the cart are excluded when possible. Do not configure unavailable or gift-card products as default upsells.']
      },
      {
        id: 'checkout',
        title: 'Discounts and checkout',
        body: ['PALS can pass a configured discount code through the cart flow, but the price change must be created using Shopify discounts or a compatible Shopify Function. Always verify the final price at checkout.']
      }
    ]
  },
  {
    slug: 'product-pages',
    title: 'Product pages',
    eyebrow: 'PRODUCT',
    intro: 'Configure media, variants, selling information and recommendations using native Shopify data.',
    keywords: ['variants', 'gallery', 'pickup', 'accordion', 'recommendations', 'sold out'],
    sections: [
      {
        id: 'product-form',
        title: 'Product form',
        body: ['Variant selectors update availability, price and the selected variant ID. Quantity controls respect minimum and step values supplied by Shopify. Sold-out variants disable the purchase action.']
      },
      {
        id: 'details',
        title: 'Details and accordions',
        body: ['Use blocks for description, product details, ingredients, care information, shipping and returns. Connect dynamic sources when information varies by product.']
      },
      {
        id: 'pickup',
        title: 'Pickup availability',
        body: ['Pickup information appears only when local pickup is configured for the selected variant. Test at least one pickup-enabled and one delivery-only product.']
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        body: ['The related-products section uses Shopify product recommendations. Recently viewed products are stored in the visitor browser and appear after products have been visited.']
      }
    ]
  },
  {
    slug: 'collections',
    title: 'Collections',
    eyebrow: 'CATALOG',
    intro: 'Help visitors browse real products with filtering, sorting, quick buy and responsive grids.',
    keywords: ['filters', 'sort', 'pagination', 'collection', 'grid', 'quick buy'],
    sections: [
      {
        id: 'collection-source',
        title: 'Collection source',
        body: ['Collection templates automatically display the products assigned to the current Shopify collection. Configure collection title, description, image and SEO fields in Shopify admin.']
      },
      {
        id: 'filtering',
        title: 'Filtering and sorting',
        body: ['Enable filters in the collection section and configure available filters using Shopify Search & Discovery. Sorting uses Shopify collection sort options.'],
        note: { type: 'info', text: 'A filter must be configured in Search & Discovery before it can appear in the theme.' }
      },
      {
        id: 'grid',
        title: 'Responsive grid',
        body: ['Set desktop and mobile column counts independently. Keep card media ratios consistent to reduce layout shift and make comparison easier.']
      }
    ]
  },
  {
    slug: 'pet-finder-quiz',
    title: 'Pet Finder Quiz',
    eyebrow: 'GUIDED DISCOVERY',
    intro: 'Create merchant-defined questions and route answers to configured products or collections.',
    keywords: ['quiz', 'questions', 'answers', 'results', 'tags', 'products', 'collections'],
    sections: [
      {
        id: 'questions',
        title: 'Create questions',
        body: ['Add question blocks in the Pet Finder Quiz section. Give each question a stable key and add answer options inside the question configuration. Keep answer labels short and mutually understandable.']
      },
      {
        id: 'mapping',
        title: 'Map answers to results',
        body: ['Each answer can add a result key. Configure result blocks that match one or more keys, then select the product or collection the visitor should see. More specific matches should be placed before broad fallback results.'],
        bullets: ['Use native product and collection selectors.', 'Add a default result for unmatched combinations.', 'Provide a restart action after results are shown.']
      },
      {
        id: 'testing',
        title: 'Test the logic',
        body: ['Run every meaningful answer path in the Theme Editor preview. Confirm that removed products, empty collections and conflicting answers produce a useful fallback rather than a blank result.']
      }
    ]
  },
  {
    slug: 'build-a-box',
    title: 'Build a Box',
    eyebrow: 'BUNDLES',
    intro: 'Let visitors select eligible products, meet a box requirement and add the selected variants to cart.',
    keywords: ['bundle', 'box', 'minimum', 'maximum', 'discount', 'automatic discount', 'variants'],
    sections: [
      {
        id: 'products',
        title: 'Select eligible products',
        body: ['Choose a Shopify collection or individual products. Configure the minimum, maximum and optional required number of selections. Product availability and variant IDs come from Shopify.']
      },
      {
        id: 'rules',
        title: 'Selection rules',
        bullets: ['Show live progress such as 2 of 4 selected.', 'Disable the add-to-cart action until the minimum is met.', 'Prevent selection beyond the configured maximum.', 'Explain how unavailable products affect the requirement.']
      },
      {
        id: 'discount',
        title: 'Configure the discount',
        body: ['Create the matching automatic discount or discount code under Shopify admin → Discounts. Enter the same customer-facing discount message in the section settings. If using a code, configure the section to send that code into the cart or checkout flow.'],
        note: { type: 'warning', text: 'Theme code cannot securely change checkout prices by itself. The actual discount must exist in Shopify and must be tested at checkout.' }
      },
      {
        id: 'verify',
        title: 'Verify the full flow',
        body: ['Test different variants, sold-out products, the minimum and maximum, cart quantity changes, discount eligibility and checkout. Confirm that every selected item reaches the cart.']
      }
    ]
  },
  {
    slug: 'animations',
    title: 'Animations',
    eyebrow: 'MOTION',
    intro: 'Apply optional motion consistently while preserving performance and reduced-motion behavior.',
    keywords: ['fade', 'slide', 'reveal', 'stagger', 'tilt', 'reduced motion'],
    sections: [
      {
        id: 'entrances',
        title: 'Entrance effects',
        body: ['Sections can use Fade, Slide left, Slide right, Rise, Scale or Stagger. Animation triggers when the section enters the viewport.']
      },
      {
        id: 'intensity',
        title: 'Motion intensity',
        body: ['Choose Off, Gentle or Playful in Theme settings. Section controls can override the entrance style but should remain within the global intensity.']
      },
      {
        id: 'performance',
        title: 'Performance and accessibility',
        bullets: ['Animate transforms and opacity rather than layout dimensions.', 'Avoid animating every card in a large collection.', 'PALS disables non-essential motion when reduced motion is requested.', 'Verify that content remains visible when JavaScript is delayed.']
      }
    ]
  },
  {
    slug: 'accessibility',
    title: 'Accessibility',
    eyebrow: 'INCLUSIVE COMMERCE',
    intro: 'Maintain the theme’s accessible foundation when adding content, colors and uploaded media.',
    keywords: ['alt text', 'headings', 'keyboard', 'focus', 'contrast', 'screen reader'],
    sections: [
      {
        id: 'content',
        title: 'Content structure',
        bullets: ['Use one descriptive H1 per page.', 'Keep heading levels in logical order.', 'Write meaningful link and button labels.', 'Add useful alternative text to informative images and leave decorative alt text empty.']
      },
      {
        id: 'interaction',
        title: 'Keyboard and focus',
        body: ['Test menus, drawers, dialogs, product controls, quiz answers and bundle controls using only the keyboard. Focus must remain visible and return to the triggering control when an overlay closes.']
      },
      {
        id: 'visual',
        title: 'Contrast and motion',
        body: ['Check every merchant-selected color combination. Information must not rely on color alone. Keep reduced-motion support enabled and avoid placing decorative visuals over readable content.']
      }
    ]
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    eyebrow: 'FIXES',
    intro: 'Resolve common setup problems before sending a support request.',
    keywords: ['error', 'missing', 'not working', 'discount', 'cart', 'mobile', 'recently viewed'],
    sections: [
      {
        id: 'missing-products',
        title: 'Products or images are missing',
        body: ['Confirm that the product is active, available to the Online Store sales channel and included in the selected collection. Check that the selected variant has media and a valid price.']
      },
      {
        id: 'quiz-result',
        title: 'Quiz shows no result',
        body: ['Check that answer result keys exactly match a configured result block. Add a fallback result and confirm that its product or collection is published.']
      },
      {
        id: 'box-discount',
        title: 'Build a Box discount is not applied',
        body: ['Confirm that the discount exists in Shopify, is active, matches the selected products, meets minimum requirements and is not blocked by discount-combination rules. Test the final checkout total.']
      },
      {
        id: 'cart-drawer',
        title: 'Cart drawer does not open',
        body: ['Confirm Cart drawer is selected in Theme settings. Test in an unmodified theme copy and temporarily disable app embeds that replace or intercept cart actions.']
      },
      {
        id: 'header-overlap',
        title: 'Header pet overlaps mobile controls',
        body: ['Use the mobile size and position settings, reduce tail overlap or disable the pet on mobile. Transparent padding inside the uploaded image also affects its visible position.']
      },
      {
        id: 'recently-viewed',
        title: 'Recently viewed is empty',
        body: ['This is expected for a new visitor. Open one or more product pages, then navigate to a page containing the recently viewed section. Private browsing and cleared storage reset the list.']
      },
      {
        id: 'editor-cache',
        title: 'Theme Editor change is not visible',
        body: ['Confirm the correct theme and template are open, save the editor, then reload the preview. Duplicate the theme before editing code or restoring an earlier version.']
      }
    ]
  }
];

export const docBySlug = new Map(docs.map((doc) => [doc.slug, doc]));

export const popularGuides = [
  'header',
  'pet-finder-quiz',
  'build-a-box',
  'cart-drawer',
  'product-cards',
  'animations'
].map((slug) => docBySlug.get(slug)!);
