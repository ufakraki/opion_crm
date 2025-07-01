# Opion CRM

Opion CRM is a customer relationship management (CRM) software developed by Altaion Interactive. This application is designed to help companies manage their customer interactions, track sales, and maintain company information efficiently.

## Features

- **User Roles**: 
  - Super Admin: Can create companies and assign company admins.
  - Company Admin: Can create company users and manage company cards.
  - Company User: Can create and manage company cards, view reminders, and update company information.

- **Company Card Management**: 
  - Create and manage company cards with essential details such as name, sector, phone number, email, notes, and status checkboxes (Sale Made, Not Attending Fair).
  - Automatic reminders for follow-ups based on last interaction date.

- **Search Functionality**: 
  - Quick search for company cards to facilitate easy access to information.

- **Dashboard**: 
  - A user-friendly dashboard for company users to view their company cards and reminders.

## Tech Stack

- **Frontend**: Built with Next.js for a responsive and dynamic user interface.
- **Backend**: Utilizes Supabase for database management and authentication.
- **Deployment**: The application is deployed on Vercel for easy access and scalability.

## Setup Instructions

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd opion_crm
   ```

2. **Install Dependencies**:
   Navigate to the `frontend` directory and install the necessary packages:
   ```
   cd frontend
   npm install
   ```

3. **Database Setup**:
   - Use the `schema.sql` file located in the `database` directory to set up your database in Supabase.

4. **Environment Variables**:
   - Configure your environment variables for Supabase in a `.env.local` file in the `frontend` directory.

5. **Run the Application**:
   ```
   npm run dev
   ```

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000` to access the application.

## Usage Guidelines

- Super Admins can create companies and assign roles.
- Company Admins can manage users and company cards.
- Company Users can create and manage their company cards and view reminders.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.