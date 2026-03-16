# Estimates Module

This module provides comprehensive estimate management functionality for the application.

## Features

### 1. Estimates List
- **Table View**: Displays estimates in a sortable, filterable table similar to CRM leads
- **Search**: Full-text search across estimate data
- **Filters**: Filter by status and customer
- **Pagination**: Efficient pagination for large datasets
- **Actions**: View, edit, and download estimate actions
- **Modal Details**: Detailed estimate view in a side modal

### 2. Estimate Templates
- **Template Management**: Create, edit, and manage estimate templates
- **Template Categories**: Organize templates by category (Renovation, Kitchen, Bathroom, Commercial)
- **Template Status**: Activate/deactivate templates
- **Template Actions**: View, edit, duplicate, and delete templates

## Components

### Main Components
- `Estimates/index.js` - Main container with tab navigation
- `EstimatesList.js` - Estimates list with table and filters
- `EstimateContent.js` - Detailed estimate view modal
- `EstimatesTemplates.js` - Template management interface

### Styling
- `estimates.scss` - Main estimates container styles
- `EstimatesList.scss` - List view styles
- `EstimateContent.scss` - Modal content styles
- `EstimatesTemplates.scss` - Template management styles

## API Integration

The module integrates with the following API endpoints:
- `GET /estimates/getEstimatesData` - Fetch estimates list
- `GET /estimates/getEstimateById/{id}` - Fetch estimate details
- `POST /estimates/updateEstimateFields` - Update estimate fields
- `GET /estimates/getTemplates` - Fetch templates
- `POST /estimates/createTemplate` - Create new template
- `POST /estimates/updateTemplate/{id}` - Update template
- `DELETE /estimates/deleteTemplate/{id}` - Delete template

## Navigation

The Estimates module is accessible through the main navigation sidebar:
- **Estimates** (main menu)
  - **Estimate List** - View and manage estimates
  - **Templates** - Manage estimate templates

## User Permissions

The Estimates module is available to users with the following roles:
- Super Admin
- Admin
- Estimator

## Responsive Design

All components are fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Features in Detail

### Estimates List Features
- **Sortable Columns**: Click column headers to sort
- **Advanced Filtering**: Filter by status and customer
- **Search Functionality**: Real-time search across all fields
- **Pagination**: Navigate through large datasets
- **Action Buttons**: Quick access to view, edit, and download actions
- **Status Badges**: Visual status indicators
- **Responsive Table**: Mobile-friendly table layout

### Template Management Features
- **Grid Layout**: Card-based template display
- **Template Status**: Visual active/inactive indicators
- **Bulk Actions**: Manage multiple templates
- **Template Details**: Comprehensive template information
- **Category Organization**: Group templates by type
- **Quick Actions**: Fast access to common operations

## Future Enhancements

Potential future improvements could include:
- Estimate PDF generation
- Email estimate functionality
- Estimate approval workflow
- Advanced reporting and analytics
- Template versioning
- Estimate comparison tools
