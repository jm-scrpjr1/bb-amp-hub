
# AI Workbench™ - React.js Clone

A complete React.js clone of the AI Workbench interface built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI**: Clean and responsive design matching the original AI Workbench interface
- **Navigation**: Complete sidebar navigation with all sections (Home, Prompt Tutor, AI Agents, etc.)
- **Dashboard**: Welcome section with robot character, quick action cards, and activity feed
- **Right Sidebar**: Training progress tracking and message center
- **Tutorial Tour**: Interactive guided tour to introduce users to different sections
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Mock Data**: Placeholder data for all sections and components
- **TypeScript**: Full type safety throughout the application
- **Modern Stack**: Next.js 14, React 18, Tailwind CSS, and Shadcn UI components

## 📋 Requirements

- Node.js 18+ 
- npm or yarn
- Modern web browser

## 🛠️ Installation & Setup

### Local Development

1. **Clone or download this repository**
   ```bash
   cd ai_workbench_clone/app
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   yarn dev
   # or 
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🌐 Deployment

### AWS S3 Static Website Hosting

1. **Build the application**
   ```bash
   yarn build
   yarn export
   # or
   npm run build
   npm run export
   ```

2. **Upload to S3**
   - Create an S3 bucket
   - Enable static website hosting
   - Upload the `out` folder contents to your bucket
   - Configure bucket policies for public access
   - Access via S3 website endpoint

### GitHub Pages Deployment

1. **Push to GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Configure GitHub Pages**
   - Go to repository Settings > Pages
   - Select source branch (main)
   - Your app will be available at `https://<username>.github.io/<repo-name>`

### Vercel Deployment (Recommended)

1. **Push to GitHub** (as above)

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy automatically

## 📁 Project Structure

```
ai_workbench_clone/app/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── [pages]/           # Individual route pages
├── components/            # React components
│   ├── layout/           # Layout components (Sidebar, Header)
│   ├── dashboard/        # Dashboard-specific components
│   ├── tutorial/         # Tutorial tour component
│   ├── ui/               # Shadcn UI components
│   └── common/           # Reusable components
├── lib/                  # Utilities and data
│   ├── utils.ts          # Utility functions
│   └── mock-data.ts      # Mock/placeholder data
└── public/               # Static assets
```

## 🎯 Key Components

### Layout Components
- **Sidebar**: Left navigation with all menu items
- **Header**: Top bar with user profile
- **RightSidebar**: Training progress and messages
- **MainLayout**: Main layout wrapper

### Dashboard Components  
- **WelcomeSection**: Hero section with robot character
- **QuickActions**: Action cards for common tasks
- **BoldUpdates**: News and updates section
- **ActivitySection**: Recent activity feed

### Features
- **TutorialTour**: Interactive guided tour
- **PageTemplate**: Consistent layout for all pages
- **Responsive Design**: Mobile-friendly interface

## 🎨 Customization

### Colors & Theme
The application uses a blue and white color scheme. To modify:
- Update `app/globals.css` for custom CSS variables
- Modify `tailwind.config.ts` for Tailwind theme customization
- Edit component classes for specific styling changes

### Mock Data
All placeholder data is centralized in `lib/mock-data.ts`:
- User information
- Training data  
- Messages and notifications
- Activity feed items
- Navigation structure

### Adding New Pages
1. Create a new folder in `app/` 
2. Add a `page.tsx` file
3. Use the `PageTemplate` component for consistency
4. Update navigation in `lib/mock-data.ts` if needed

## 📱 Tutorial Tour

The application includes an interactive tutorial tour that guides users through different sections:
- Welcome section explanation
- Navigation overview  
- Quick actions demonstration
- Feature highlights
- Right sidebar walkthrough

Start the tour by clicking the "Start Tutorial Tour" button in the sidebar.

## 🔧 Technical Details

### Built With
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better developer experience  
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: High-quality React components
- **Lucide React**: Beautiful icons
- **Framer Motion**: Smooth animations and transitions

### Performance Features
- Server-side rendering (SSR)
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Responsive images and layouts
- Optimized bundle size

## 🐛 Known Issues & Limitations

- This is a frontend-only clone with no backend functionality
- All data is mocked/placeholder data
- Authentication is visual only (no real login system)
- Forms submit to console (no actual form processing)
- Some advanced features are "Coming Soon" placeholders

## 🤝 Contributing

This is a complete clone ready for deployment. To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly 
5. Submit a pull request

## 📄 License

This project is for educational/demonstration purposes. Please ensure you have appropriate rights before using in production.

## 🆘 Support

For issues or questions:
1. Check the console for any error messages
2. Verify all dependencies are installed correctly
3. Ensure you're using Node.js 18+
4. Test in different browsers

## 🚀 Next Steps

After deployment, you can:
1. Replace mock data with real API calls
2. Implement user authentication
3. Add backend functionality  
4. Customize styling and branding
5. Add more interactive features
6. Integrate with external services

---

**Built with ❤️ using Next.js and React**
