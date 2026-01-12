<div align="center">
  <img src="src/logo/zwertelogo-light.png" alt="zwerte Logo" width="300" />
  
  # zwerte - Lottery System Works
  
  **A world-class, enterprise-grade lottery number generator with advanced analytics, Monte Carlo simulations, and premium design.**

  [![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
  [![License](https://img.shields.io/badge/License-MIT_CC_BY_4.0-green?style=for-the-badge)](LICENSE)

</div>

---

## Features

### Number Selection System
- **Main Number Grid**: Select 6 numbers from 01-31 with intuitive visual feedback
- **Bonus Number Selection**: Pick 1 bonus number from 01-12 with distinct styling
- **Real-time Validation**: Instant selection count tracking with animated indicators
- **Clear & Reset**: One-click functionality to reset all selections

### Quick Pick Randomizer
- **AI-Powered Generation**: Intelligent random number generation algorithm
- **Shuffle Animation**: Smooth visual feedback during number generation
- **Instant Selection**: Auto-populates both main and bonus numbers

### Analytics Dashboard
- **Real-time Odds Calculation**: Displays exact winning probability (1 in 8,835,372)
- **Live Selection Analysis**: Dynamic metrics based on current number selection
- **Statistical Indicators**:
  - Sum total analysis
  - Odd/Even ratio balance
  - High/Low number distribution
  - Consecutive number detection
  - Selection quality scoring

### Monte Carlo Simulation Engine
- **Configurable Simulations**: Run 1,000 to 1,000,000 lottery draws
- **Real-time Statistics**: Track matches, wins, and probability convergence
- **Visual Progress**: Animated progress indicators and result displays
- **Historical Analysis**: Compare theoretical vs. actual probabilities

### Theme System
- **Light/Dark Mode**: Beautiful theme toggle with smooth transitions
- **System Preference Detection**: Auto-detects user's preferred color scheme
- **Consistent Design Language**: Premium aesthetics in both themes

### Data Export
- **CSV Export**: Download selections in spreadsheet-compatible format
- **TXT Receipt**: Generate printable lottery ticket receipt
- **Timestamped**: All exports include generation date and time

### Premium UI/UX
- **Glassmorphism Design**: Modern frosted-glass visual effects
- **Micro-animations**: Subtle hover effects and transitions
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Enterprise-grade Polish**: World-class attention to detail

---

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramonloganjr/zwerte.git
   cd zwerte
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## Tech Stack

<table>
  <tr>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="48" height="48" alt="Next.js" />
      <br><strong>Next.js 16</strong>
      <br><sub>React Framework</sub>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="48" height="48" alt="React" />
      <br><strong>React 19</strong>
      <br><sub>UI Library</sub>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
      <br><strong>TypeScript 5</strong>
      <br><sub>Type Safety</sub>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="48" height="48" alt="Tailwind CSS" />
      <br><strong>Tailwind CSS 4</strong>
      <br><sub>Styling</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="120">
      <img src="https://www.framer.com/images/favicons/favicon.png" width="48" height="48" alt="Framer Motion" />
      <br><strong>Framer Motion</strong>
      <br><sub>Animations</sub>
    </td>
    <td align="center" width="120">
      <img src="https://lucide.dev/logo.light.svg" width="48" height="48" alt="Lucide" />
      <br><strong>Lucide React</strong>
      <br><sub>Icons</sub>
    </td>
    <td align="center" width="120">
      <img src="https://mathjs.org/img/favicon.ico" width="48" height="48" alt="Math.js" />
      <br><strong>Math.js</strong>
      <br><sub>Calculations</sub>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eslint/eslint-original.svg" width="48" height="48" alt="ESLint" />
      <br><strong>ESLint 9</strong>
      <br><sub>Code Quality</sub>
    </td>
  </tr>
</table>

---

## Project Structure

```
zwerte/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with SEO metadata
│   │   ├── page.tsx          # Main application page
│   │   └── globals.css       # Global styles and CSS variables
│   ├── components/
│   │   ├── AnalyticsDashboard.tsx   # Statistics and analytics
│   │   ├── SimulationEngine.tsx     # Monte Carlo simulator
│   │   ├── NumberGrid.tsx           # Main number selection
│   │   ├── BonusNumber.tsx          # Bonus number selection
│   │   ├── QuickPick.tsx            # Random generator button
│   │   ├── ThemeToggle.tsx          # Light/dark mode switch
│   │   └── Logo.tsx                 # Application logo
│   ├── context/
│   │   └── ThemeContext.tsx  # Theme state management
│   ├── utils/
│   │   └── mathUtils.ts      # Probability calculations
│   └── logo/                 # Logo assets
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## Mathematical Foundation

The probability calculations are based on combinatorics:

- **Main Numbers**: C(31, 6) = 736,281 combinations
- **Bonus Number**: C(12, 1) = 12 combinations
- **Total Odds**: 736,281 x 12 = **1 in 8,835,372**

---

## License

This project is licensed under the **MIT License with CC BY 4.0** - see the [LICENSE](LICENSE) file for details.

---

## Author

<div align="center">
  
  **Ramon Logan Jr.**
  
  [![GitHub](https://img.shields.io/badge/GitHub-ramonloganjr-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ramonloganjr)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Ramon_Logan_Jr-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ramon-logan-jr)
  [![Website](https://img.shields.io/badge/Website-ramonloganjr.com-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ramonloganjr.com)
  
</div>

---

<div align="center">
  <sub>Built with care by Ramon Logan Jr. | Copyright 2026 All Rights Reserved</sub>
</div>
