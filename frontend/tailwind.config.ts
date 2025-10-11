import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      colors: {
        // Dark theme colors for the bridge interface
        background: 'hsl(222, 84%, 5%)', // Very dark blue
        foreground: 'hsl(210, 40%, 98%)', // Almost white
        
        card: 'hsl(222, 84%, 5%)',
        'card-foreground': 'hsl(210, 40%, 98%)',
        
        popover: 'hsl(224, 71%, 4%)',
        'popover-foreground': 'hsl(210, 40%, 98%)',
        
        // Primary brand colors - purple/indigo theme
        primary: 'hsl(263, 70%, 50%)', // Purple
        'primary-foreground': 'hsl(210, 40%, 98%)',
        
        secondary: 'hsl(215, 25%, 27%)', // Dark slate
        'secondary-foreground': 'hsl(210, 40%, 98%)',
        
        // Accent colors for highlights
        accent: 'hsl(263, 70%, 50%)',
        'accent-foreground': 'hsl(210, 40%, 98%)',
        
        // State colors
        destructive: 'hsl(0, 62%, 30%)',
        'destructive-foreground': 'hsl(210, 40%, 98%)',
        
        success: 'hsl(142, 76%, 36%)',
        'success-foreground': 'hsl(210, 40%, 98%)',
        
        warning: 'hsl(32, 95%, 44%)',
        'warning-foreground': 'hsl(210, 40%, 98%)',
        
        // UI elements
        border: 'hsla(215, 25%, 27%, 0.4)',
        input: 'hsl(215, 25%, 27%)',
        ring: 'hsl(263, 70%, 50%)',
        
        muted: 'hsl(215, 25%, 27%)',
        'muted-foreground': 'hsl(217, 10%, 64%)',
        
        // Custom colors for NFT bridge
        'site-background': 'hsl(222, 84%, 5%)',
        'site-foreground': 'hsl(210, 40%, 98%)',
        
        // Chain specific colors
        conflux: {
          50: 'hsl(160, 100%, 97%)',
          100: 'hsl(159, 100%, 92%)',
          200: 'hsl(159, 96%, 84%)',
          300: 'hsl(158, 94%, 72%)',
          400: 'hsl(158, 89%, 58%)',
          500: 'hsl(160, 84%, 46%)', // Main Conflux color
          600: 'hsl(161, 85%, 38%)',
          700: 'hsl(163, 84%, 31%)',
          800: 'hsl(166, 78%, 26%)',
          900: 'hsl(168, 76%, 22%)',
        },
        
        base: {
          50: 'hsl(214, 100%, 97%)',
          100: 'hsl(214, 95%, 93%)',
          200: 'hsl(213, 97%, 87%)',
          300: 'hsl(212, 96%, 78%)',
          400: 'hsl(213, 94%, 68%)',
          500: 'hsl(217, 91%, 60%)', // Main Base color
          600: 'hsl(221, 83%, 53%)',
          700: 'hsl(224, 76%, 48%)',
          800: 'hsl(226, 71%, 40%)',
          900: 'hsl(224, 64%, 33%)',
        },
        
        // Gradient stops for fancy effects
        'gradient-purple': 'hsl(263, 70%, 50%)',
        'gradient-pink': 'hsl(316, 73%, 52%)',
        'gradient-blue': 'hsl(217, 91%, 60%)',
        'gradient-cyan': 'hsl(188, 94%, 47%)',
        'gradient-emerald': 'hsl(160, 84%, 46%)',
        'gradient-violet': 'hsl(270, 91%, 65%)',
      },
      
      fontFamily: {
        custom: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      
      // Custom animations
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'border-beam': 'border-beam 4s linear infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'border-beam': {
          '0%': { 'offset-distance': '0%' },
          '100%': { 'offset-distance': '100%' },
        },
      },
      
      // Custom backdrop blur
      backdropBlur: {
        'xs': '2px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      
      // Custom shadows for glassmorphism
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 16px 64px 0 rgba(31, 38, 135, 0.25)',
        'neon': '0 0 20px rgba(99, 102, 241, 0.6)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.6)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.6)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.6)',
      },
      
      // Background patterns
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        'aurora': 'linear-gradient(45deg, #a855f7, #3b82f6, #06b6d4, #10b981)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      
      typography: {
        DEFAULT: {
          css: {
            // Enhanced typography for dark theme
            color: 'hsl(210, 40%, 98%)',
            maxWidth: '100%',
            
            h1: {
              color: 'hsl(210, 40%, 98%)',
              fontSize: '2.5rem',
              fontWeight: '800',
              lineHeight: '1.1',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            },
            
            h2: {
              color: 'hsl(210, 40%, 98%)',
              fontSize: '2rem',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: '1.25rem',
            },
            
            h3: {
              color: 'hsl(210, 40%, 98%)',
              fontSize: '1.5rem',
              fontWeight: '600',
              lineHeight: '1.3',
              marginBottom: '1rem',
            },
            
            p: {
              color: 'hsl(217, 10%, 74%)',
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '1rem',
            },
            
            a: {
              color: 'hsl(263, 70%, 60%)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'hsl(263, 70%, 70%)',
                textDecoration: 'underline',
              },
            },
            
            code: {
              color: 'hsl(316, 73%, 62%)',
              backgroundColor: 'hsl(215, 25%, 27%)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: '1px solid hsla(215, 25%, 27%, 0.4)',
            },
            
            pre: {
              backgroundColor: 'hsl(215, 25%, 27%)',
              color: 'hsl(210, 40%, 98%)',
              border: '1px solid hsla(215, 25%, 27%, 0.4)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              overflowX: 'auto',
              margin: '1.5rem 0',
            },
            
            blockquote: {
              color: 'hsl(217, 10%, 74%)',
              borderLeft: '4px solid hsl(263, 70%, 50%)',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              fontSize: '1.125rem',
              margin: '2rem 0',
              backgroundColor: 'hsla(263, 70%, 50%, 0.05)',
              padding: '1rem 1.5rem',
              borderRadius: '0.5rem',
            },
            
            strong: {
              color: 'hsl(210, 40%, 98%)',
              fontWeight: '700',
            },
            
            em: {
              color: 'hsl(316, 73%, 62%)',
              fontStyle: 'italic',
            },
            
            // Table styles for dark theme
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '2rem',
              backgroundColor: 'hsl(215, 25%, 27%)',
              border: '1px solid hsla(215, 25%, 27%, 0.4)',
              borderRadius: '0.75rem',
              overflow: 'hidden',
            },
            
            th: {
              backgroundColor: 'hsl(215, 25%, 20%)',
              color: 'hsl(210, 40%, 98%)',
              fontWeight: '600',
              padding: '1rem',
              textAlign: 'left',
              borderBottom: '2px solid hsla(215, 25%, 27%, 0.4)',
            },
            
            td: {
              color: 'hsl(217, 10%, 74%)',
              padding: '1rem',
              borderBottom: '1px solid hsla(215, 25%, 27%, 0.4)',
            },
            
            // List styles
            ul: {
              listStyleType: 'none',
              paddingLeft: '0',
            },
            
            'ul > li': {
              position: 'relative',
              paddingLeft: '2rem',
              marginBottom: '0.75rem',
              
              '&::before': {
                content: '"▶"',
                position: 'absolute',
                left: '0',
                color: 'hsl(263, 70%, 50%)',
                fontWeight: 'bold',
              },
            },
            
            ol: {
              paddingLeft: '2rem',
              counterReset: 'item',
            },
            
            'ol > li': {
              display: 'block',
              marginBottom: '0.75rem',
              
              '&::before': {
                content: 'counter(item) "."',
                counterIncrement: 'item',
                fontWeight: 'bold',
                color: 'hsl(263, 70%, 50%)',
                marginRight: '0.5rem',
              },
            },
          },
        },
      },
      
      // Custom grid templates
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))',
      },
      
      // Custom spacing for bridge components
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    // Add any plugins you need
  ],
};

export default config;