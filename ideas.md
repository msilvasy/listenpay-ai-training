# ListenPay Medical — Conversion Design Specification

## Ground-Truth Reference

The supplied `listenpay-programs.html` is the source of truth for the Angular conversion. The finished application will preserve its vertically stacked clinical-portal layout, navy and teal healthcare visual system, compact mobile-first content cards, right-side slide-out account menu, bottom navigation, and the supplied worker imagery. Angular routing will replace the original `showView()` DOM switching, and the standalone login dialog will appear on each application bootstrap after `npm start`.

## Chosen Approach — Clinical Signal Console

**Design Movement:** Functional healthcare interface design, adapted from the source page’s compact patient-portal and clinical-dashboard language.

**Core Principles:** First, retain the source page’s deep-navy header and healthcare signal motifs. Second, preserve scan-friendly card hierarchy and restrained status colors. Third, replace direct DOM mutations with explicit Angular routes, state bindings, and semantic buttons. Fourth, present authentication as an intentional entry point rather than a hidden technical behavior.

**Color Philosophy:** Deep navy establishes a credible care-and-compliance frame; bright blue provides wayfinding; teal signals active engagement and earned value. Pale blue surfaces keep reading comfortable while green is limited to successful completion states.

**Layout Paradigm:** A mobile portal shell with a stable masthead and bottom route rail surrounds changing route content. A slide-out account panel acts as secondary navigation, while individual route pages adapt the source page’s stacked content sections.

**Signature Elements:** The repeated waveform line in the masthead, the ascending four-bar audio mark, and thin blue-to-teal progress accents will bind every page to the ListenPay identity.

**Interaction Philosophy:** Navigation changes represent true URL transitions. The account panel slides from the right, the sign-in dialog takes immediate focus at launch, and feedback surfaces are concise, accessible, and unobtrusive.

**Animation:** Use 180–260ms opacity and transform transitions with `cubic-bezier(0.23, 1, 0.32, 1)`. The login dialog fades and rises from `scale(0.96)`; the menu translates horizontally. Motion is disabled for users who prefer reduced motion.

**Typography System:** `Source Sans 3` provides accessible clinical body copy; `Manrope` provides concise, high-contrast headings, controls, and balance figures. Route titles remain visually dominant, while labels use modest uppercase letter spacing.

**Brand Essence:** A medical-content engagement portal for workers who earn while completing trusted learning material. **Credible, supportive, focused.**

**Brand Voice:** Headlines are direct and progress-oriented; CTAs are action-based and specific. Example lines: “Continue your learning journey.” and “Sign in to access your earned balance.”

**Wordmark & Logo:** A four-rung ascending audio-signal mark anchors the `ListenPay` wordmark. The mark appears as a standalone favicon and beside the wordmark, never as default text alone.

**Signature Brand Color:** **Signal Teal — `#1ab8b8`**.

## Style Decisions

The four-rung audio mark and waveform motif recur in the masthead, dashboard hero, category cards, and progress treatment. The dashboard hero always combines worker imagery with a direct reward message, while category cards show restrained teal-blue completion rails rather than acting as neutral icon tiles. On desktop, the portal remains intentionally framed as a compact member experience rather than expanding into a generic full-width dashboard.

## Implementation Status

The source HTML has been converted to a standalone Angular 20 application. Route-driven views replace DOM-level view toggling, and the login dialog initializes open on every fresh application bootstrap, including each `npm start` launch.

## Dynamic Portal Refinements

Route headings now state the member’s clinical learning or earning purpose directly, while every major hero and card surface carries a waveform, four-bar mark, or blue-to-teal progress cue. The navigation rail is a compact elevated control rather than a full-width interruption. The dashboard and analytics contexts use focused healthcare-learning imagery, and cards use tighter clinical-console borders and signal rails.
