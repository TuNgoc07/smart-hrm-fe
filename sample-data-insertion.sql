-- SmartOps HRM Sample Data Insertion Script
-- This script inserts realistic sample data for testing the database schema

-- =================================================================
-- 1. ROLES DATA (Insert first - referenced by other tables)
-- =================================================================

INSERT INTO roles (role_name, display_name, description, permissions) VALUES
('hr_admin', 'HR Administrator', 'Full access to HR functions', 
 '{"users": ["read", "write", "delete"], "employees": ["read", "write", "delete"], "payroll": ["read", "write", "delete"], "departments": ["read", "write", "delete"], "positions": ["read", "write", "delete"], "workflows": ["read", "write", "delete"], "reports": ["read", "write", "delete"]}'),
('manager', 'Manager', 'Department level access', 
 '{"employees": ["read", "write"], "attendance": ["read", "write"], "reports": ["read"], "requests": ["read", "write"], "payroll": ["read"], "workflows": ["read", "write"]}'),
('employee', 'Employee', 'Self-service access', 
 '{"profile": ["read", "write"], "attendance": ["read"], "leave": ["read", "write"], "requests": ["read", "write"], "documents": ["read", "write"], "payroll": ["read"]}');

-- =================================================================
-- 2. USERS DATA
-- =================================================================

INSERT INTO users (user_id, username, password_hash, status, last_login) VALUES
(1, 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'active', '2024-02-28 09:00:00'),
(2, 'sarah.jenkins', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'active', '2024-02-28 08:30:00'),
(3, 'alex.rivera', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'active', '2024-02-28 08:45:00'),
(4, 'alex.wright', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'active', '2024-02-28 09:15:00'),
(5, 'john.smith', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'active', '2024-02-28 07:30:00'),
(6, 'jane.doe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'active', '2024-02-28 08:00:00'),
(7, 'mike.johnson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'active', '2024-02-28 09:20:00'),
(8, 'emily.chen', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'active', '2024-02-28 08:10:00');

-- =================================================================
-- 3. USER_ROLES DATA
-- =================================================================

INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES
(1, 1, 1, '2024-01-01 00:00:00'), -- admin -> HR Admin
(2, 1, 1, '2024-01-02 09:00:00'), -- sarah.jenkins -> HR Admin
(3, 2, 1, '2024-01-02 09:30:00'), -- alex.rivera -> Manager
(4, 3, 1, '2024-01-03 10:00:00'), -- alex.wright -> Employee
(5, 3, 1, '2024-01-03 10:30:00'), -- john.smith -> Employee
(6, 3, 1, '2024-01-04 11:00:00'), -- jane.doe -> Employee
(7, 2, 1, '2024-01-04 11:30:00'), -- mike.johnson -> Manager
(8, 3, 1, '2024-01-05 12:00:00'); -- emily.chen -> Employee

-- =================================================================
-- 4. DEPARTMENTS DATA
-- =================================================================

INSERT INTO departments (department_code, department_name, manager_id, description, status) VALUES
('ENG-001', 'Engineering', 'EMP-1001', 'Software development and technology infrastructure', 'active'),
('HR-001', 'Human Resources', 'EMP-2001', 'Employee management and organizational development', 'active'),
('FIN-001', 'Finance', 'EMP-3001', 'Financial planning and accounting', 'active'),
('MKT-001', 'Marketing', 'EMP-4001', 'Brand management and customer acquisition', 'active'),
('OPS-001', 'Operations', 'EMP-5001', 'Business operations and process optimization', 'active'),
('PRO-001', 'Product', 'EMP-6001', 'Product strategy and development', 'active');

-- =================================================================
-- 5. POSITIONS DATA
-- =================================================================

INSERT INTO positions (position_code, position_name, department_id, job_level, description, status) VALUES
-- Engineering Positions
('ENG-001', 'Junior Software Engineer', 1, 'L2', 'Entry-level software development role', 'active'),
('ENG-002', 'Software Engineer', 1, 'L3', 'Mid-level software development role', 'active'),
('ENG-003', 'Senior Software Engineer', 1, 'L4', 'Senior software development role', 'active'),
('ENG-004', 'Lead Software Engineer', 1, 'L5', 'Technical leadership role', 'active'),
('ENG-005', 'Engineering Manager', 1, 'L6', 'Team management and technical leadership', 'active'),
('ENG-006', 'DevOps Engineer', 1, 'L4', 'Infrastructure and deployment specialist', 'active'),
('ENG-007', 'QA Engineer', 1, 'L3', 'Quality assurance and testing', 'active'),

-- HR Positions
('HR-001', 'HR Assistant', 2, 'L2', 'Administrative HR support', 'active'),
('HR-002', 'HR Specialist', 2, 'L3', 'Specialized HR functions', 'active'),
('HR-003', 'HR Manager', 2, 'L5', 'HR department management', 'active'),

-- Finance Positions
('FIN-001', 'Junior Accountant', 3, 'L2', 'Entry-level accounting role', 'active'),
('FIN-002', 'Senior Accountant', 3, 'L4', 'Experienced accounting professional', 'active'),
('FIN-003', 'Finance Manager', 3, 'L6', 'Financial department leadership', 'active'),

-- Marketing Positions
('MKT-001', 'Marketing Coordinator', 4, 'L2', 'Marketing campaign coordination', 'active'),
('MKT-002', 'Marketing Specialist', 4, 'L3', 'Specialized marketing functions', 'active'),
('MKT-003', 'Marketing Manager', 4, 'L5', 'Marketing team leadership', 'active'),

-- Product Positions
('PRO-001', 'Junior Product Designer', 6, 'L2', 'Entry-level product design', 'active'),
('PRO-002', 'Product Designer', 6, 'L3', 'Product design and user experience', 'active'),
('PRO-003', 'Senior Product Designer', 6, 'L4', 'Senior product design leadership', 'active');

-- =================================================================
-- 6. EMPLOYEES DATA
-- =================================================================

INSERT INTO employees (employee_id, user_id, first_name, last_name, avatar_url, date_of_birth, gender, nationality, marital_status, personal_email, work_email, phone, linkedin_profile, identification_code, identification_issue_date, identification_issue_place, permanent_address, current_address, hire_date, employment_status) VALUES
-- Engineering Team
('EMP-1001', 3, 'Alex', 'Rivera', 'https://randomuser.me/api/portraits/men/65.jpg', '1985-03-15', 'male', 'American', 'married', 'alex.rivera@gmail.com', 'alex.rivera@smartops.com', '+1-555-0101', 'linkedin.com/in/alexrivera', 'SS123456789', '2010-01-15', 'Social Security Administration', '123 Main St, New York, NY 10001', '123 Main St, New York, NY 10001', '2020-01-15', 'active'),
('EMP-1002', 4, 'Alexander', 'Wright', 'https://randomuser.me/api/portraits/men/32.jpg', '1990-07-22', 'male', 'American', 'single', 'alex.wright@gmail.com', 'alex.wright@smartops.com', '+1-555-0102', 'linkedin.com/in/alexwright', 'SS987654321', '2012-03-20', 'Social Security Administration', '456 Oak Ave, San Francisco, CA 94102', '456 Oak Ave, San Francisco, CA 94102', '2021-03-20', 'active'),
('EMP-1003', 5, 'John', 'Smith', 'https://randomuser.me/api/portraits/men/45.jpg', '1988-11-10', 'male', 'American', 'married', 'john.smith@gmail.com', 'john.smith@smartops.com', '+1-555-0103', 'linkedin.com/in/johnsmith', 'SS456789123', '2011-06-10', 'Social Security Administration', '789 Pine St, Chicago, IL 60601', '789 Pine St, Chicago, IL 60601', '2020-06-10', 'active'),
('EMP-1004', 6, 'Jane', 'Doe', 'https://randomuser.me/api/portraits/women/28.jpg', '1992-04-18', 'female', 'American', 'single', 'jane.doe@gmail.com', 'jane.doe@smartops.com', '+1-555-0104', 'linkedin.com/in/janedoe', 'SS789123456', '2014-09-15', 'Social Security Administration', '321 Elm St, Boston, MA 02101', '321 Elm St, Boston, MA 02101', '2021-09-15', 'active'),
('EMP-1005', 7, 'Mike', 'Johnson', 'https://randomuser.me/api/portraits/men/52.jpg', '1987-09-25', 'male', 'American', 'married', 'mike.johnson@gmail.com', 'mike.johnson@smartops.com', '+1-555-0105', 'linkedin.com/in/mikejohnson', 'SS321654987', '2009-12-01', 'Social Security Administration', '654 Maple Dr, Austin, TX 78701', '654 Maple Dr, Austin, TX 78701', '2020-12-01', 'active'),
('EMP-1006', 8, 'Emily', 'Chen', 'https://randomuser.me/api/portraits/women/38.jpg', '1993-02-14', 'female', 'American', 'single', 'emily.chen@gmail.com', 'emily.chen@smartops.com', '+1-555-0106', 'linkedin.com/in/emilychen', 'SS654987321', '2015-07-20', 'Social Security Administration', '987 Cedar Ln, Seattle, WA 98101', '987 Cedar Ln, Seattle, WA 98101', '2022-07-20', 'active'),

-- HR Team
('EMP-2001', 2, 'Sarah', 'Jenkins', 'https://randomuser.me/api/portraits/women/65.jpg', '1986-05-30', 'female', 'American', 'married', 'sarah.jenkins@gmail.com', 'sarah.jenkins@smartops.com', '+1-555-0201', 'linkedin.com/in/sarahjenkins', 'SS111222333', '2008-04-10', 'Social Security Administration', '111 Birch Rd, Miami, FL 33101', '111 Birch Rd, Miami, FL 33101', '2019-04-10', 'active'),

-- Finance Team
('EMP-3001', NULL, 'Robert', 'Taylor', 'https://randomuser.me/api/portraits/men/71.jpg', '1984-08-12', 'male', 'American', 'married', 'robert.taylor@gmail.com', 'robert.taylor@smartops.com', '+1-555-0301', 'linkedin.com/in/roberttaylor', 'SS222333444', '2007-02-28', 'Social Security Administration', '222 Spruce St, Denver, CO 80201', '222 Spruce St, Denver, CO 80201', '2018-02-28', 'active'),

-- Marketing Team
('EMP-4001', NULL, 'Lisa', 'Anderson', 'https://randomuser.me/api/portraits/women/42.jpg', '1989-12-05', 'female', 'American', 'single', 'lisa.anderson@gmail.com', 'lisa.anderson@smartops.com', '+1-555-0401', 'linkedin.com/in/lisaanderson', 'SS333444555', '2013-10-15', 'Social Security Administration', '333 Willow Ave, Portland, OR 97201', '333 Willow Ave, Portland, OR 97201', '2019-10-15', 'active'),

-- Product Team
('EMP-5001', NULL, 'David', 'Martinez', 'https://randomuser.me/api/portraits/men/58.jpg', '1991-06-20', 'male', 'American', 'married', 'david.martinez@gmail.com', 'david.martinez@smartops.com', '+1-555-0501', 'linkedin.com/in/davidmartinez', 'SS444555666', '2013-03-25', 'Social Security Administration', '444 Ash Blvd, Phoenix, AZ 85001', '444 Ash Blvd, Phoenix, AZ 85001', '2020-03-25', 'active');

-- =================================================================
-- 7. EMPLOYEE_POSITIONS DATA (Job History)
-- =================================================================

INSERT INTO employee_positions (employee_id, position_id, department_id, start_date, end_date, manager_id, working_model, work_location, employment_type, is_current) VALUES
-- Alex Rivera - Engineering Manager (Current)
('EMP-1001', 5, 1, '2020-01-15', NULL, NULL, 'hybrid', 'Head Office (NYC)', 'full_time', TRUE),

-- Alexander Wright - Senior Software Engineer (Current)
('EMP-1002', 3, 1, '2021-03-20', NULL, 'EMP-1001', 'onsite', 'Head Office (NYC)', 'full_time', TRUE),

-- John Smith - Software Engineer (Current)
('EMP-1003', 2, 1, '2020-06-10', NULL, 'EMP-1001', 'hybrid', 'Head Office (NYC)', 'full_time', TRUE),

-- Jane Doe - QA Engineer (Current)
('EMP-1004', 7, 1, '2021-09-15', NULL, 'EMP-1001', 'remote', 'Remote', 'full_time', TRUE),

-- Mike Johnson - DevOps Engineer (Current)
('EMP-1005', 6, 1, '2020-12-01', NULL, 'EMP-1001', 'hybrid', 'Head Office (NYC)', 'full_time', TRUE),

-- Emily Chen - Junior Software Engineer (Current)
('EMP-1006', 1, 1, '2022-07-20', NULL, 'EMP-1001', 'onsite', 'Head Office (NYC)', 'full_time', TRUE),

-- Sarah Jenkins - HR Manager (Current)
('EMP-2001', 3, 2, '2019-04-10', NULL, NULL, 'hybrid', 'Head Office (NYC)', 'full_time', TRUE),

-- Robert Taylor - Finance Manager (Current)
('EMP-3001', 3, 3, '2018-02-28', NULL, NULL, 'onsite', 'Head Office (NYC)', 'full_time', TRUE),

-- Lisa Anderson - Marketing Manager (Current)
('EMP-4001', 3, 4, '2019-10-15', NULL, NULL, 'remote', 'Remote', 'full_time', TRUE),

-- David Martinez - Senior Product Designer (Current)
('EMP-5001', 3, 6, '2020-03-25', NULL, NULL, 'hybrid', 'Head Office (NYC)', 'full_time', TRUE);

-- =================================================================
-- 8. COMPENSATION_PLANS DATA
-- =================================================================

INSERT INTO compensation_plans (plan_id, employee_id, salary_type, base_salary, currency, effective_date, tax_resident, payment_method, ot_rate, insurance_scheme, status) VALUES
(1, 'EMP-1001', 'annual', 120000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active'),
(2, 'EMP-1002', 'annual', 95000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active'),
(3, 'EMP-1003', 'annual', 85000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active'),
(4, 'EMP-1004', 'annual', 75000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active'),
(5, 'EMP-1005', 'annual', 90000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active'),
(6, 'EMP-1006', 'annual', 65000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active'),
(7, 'EMP-2001', 'annual', 85000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active'),
(8, 'EMP-3001', 'annual', 110000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active'),
(9, 'EMP-4001', 'annual', 90000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active'),
(10, 'EMP-5001', 'annual', 85000.00, 'USD', '2023-01-01', TRUE, 'bank_transfer', 150.00, 'standard_social', 'active');

-- =================================================================
-- 9. SALARY_COMPONENTS DATA
-- =================================================================

INSERT INTO salary_components (plan_id, component_name, component_type, frequency, amount, is_percentage, status) VALUES
-- Alex Rivera - Engineering Manager
(1, 'Housing Allowance', 'allowance', 'monthly', 1500.00, FALSE, 'active'),
(1, 'Transportation Allowance', 'allowance', 'monthly', 300.00, FALSE, 'active'),
(1, 'Health Insurance', 'deduction', 'monthly', 400.00, FALSE, 'active'),
(1, '401k Contribution', 'deduction', 'monthly', 800.00, FALSE, 'active'),

-- Alexander Wright - Senior Software Engineer
(2, 'Housing Allowance', 'allowance', 'monthly', 1000.00, FALSE, 'active'),
(2, 'Transportation Allowance', 'allowance', 'monthly', 200.00, FALSE, 'active'),
(2, 'Health Insurance', 'deduction', 'monthly', 350.00, FALSE, 'active'),
(2, '401k Contribution', 'deduction', 'monthly', 600.00, FALSE, 'active'),

-- John Smith - Software Engineer
(3, 'Housing Allowance', 'allowance', 'monthly', 800.00, FALSE, 'active'),
(3, 'Transportation Allowance', 'allowance', 'monthly', 150.00, FALSE, 'active'),
(3, 'Health Insurance', 'deduction', 'monthly', 300.00, FALSE, 'active'),
(3, '401k Contribution', 'deduction', 'monthly', 500.00, FALSE, 'active'),

-- Jane Doe - QA Engineer
(4, 'Transportation Allowance', 'allowance', 'monthly', 150.00, FALSE, 'active'),
(4, 'Health Insurance', 'deduction', 'monthly', 300.00, FALSE, 'active'),
(4, '401k Contribution', 'deduction', 'monthly', 400.00, FALSE, 'active'),

-- Mike Johnson - DevOps Engineer
(5, 'Housing Allowance', 'allowance', 'monthly', 900.00, FALSE, 'active'),
(5, 'Transportation Allowance', 'allowance', 'monthly', 200.00, FALSE, 'active'),
(5, 'Health Insurance', 'deduction', 'monthly', 350.00, FALSE, 'active'),
(5, '401k Contribution', 'deduction', 'monthly', 550.00, FALSE, 'active'),

-- Emily Chen - Junior Software Engineer
(6, 'Transportation Allowance', 'allowance', 'monthly', 100.00, FALSE, 'active'),
(6, 'Health Insurance', 'deduction', 'monthly', 250.00, FALSE, 'active'),
(6, '401k Contribution', 'deduction', 'monthly', 300.00, FALSE, 'active');

-- =================================================================
-- 10. WORKFLOWS DATA
-- =================================================================

INSERT INTO workflows (workflow_name, workflow_type, description, is_active) VALUES
('Leave Request Workflow', 'leave_request', 'Standard leave approval process', TRUE),
('Expense Claim Workflow', 'expense_claim', 'Expense reimbursement approval process', TRUE),
('Promotion Request Workflow', 'promotion', 'Employee promotion approval process', TRUE),
('Termination Workflow', 'termination', 'Employee termination approval process', TRUE);

-- =================================================================
-- 11. WORKFLOW_STEPS DATA
-- =================================================================

INSERT INTO workflow_steps (workflow_id, step_name, step_order, approver_role, approver_id, is_required) VALUES
-- Leave Request Workflow
(1, 'Manager Approval', 1, 'manager', NULL, TRUE),
(1, 'HR Review', 2, 'hr_admin', NULL, TRUE),

-- Expense Claim Workflow
(2, 'Manager Approval', 1, 'manager', NULL, TRUE),
(2, 'Finance Review', 2, 'hr_admin', NULL, TRUE),

-- Promotion Request Workflow
(3, 'Manager Recommendation', 1, 'manager', NULL, TRUE),
(3, 'HR Review', 2, 'hr_admin', NULL, TRUE),
(3, 'Director Approval', 3, 'hr_admin', NULL, TRUE),

-- Termination Workflow
(3, 'Manager Initiation', 1, 'manager', NULL, TRUE),
(3, 'HR Review', 2, 'hr_admin', NULL, TRUE),
(3, 'Director Approval', 3, 'hr_admin', NULL, TRUE);

-- =================================================================
-- 12. CONTRACTS DATA
-- =================================================================

INSERT INTO contracts (contract_code, employee_id, contract_type, start_date, end_date, salary_tier, employment_status, document_url, status) VALUES
('CT-1001', 'EMP-1001', 'permanent', '2020-01-15', NULL, 'Tier 5 (Management)', 'full_time', '/documents/contracts/CT-1001.pdf', 'active'),
('CT-1002', 'EMP-1002', 'permanent', '2021-03-20', NULL, 'Tier 4 (Senior)', 'full_time', '/documents/contracts/CT-1002.pdf', 'active'),
('CT-1003', 'EMP-1003', 'permanent', '2020-06-10', NULL, 'Tier 3 (Mid-level)', 'full_time', '/documents/contracts/CT-1003.pdf', 'active'),
('CT-1004', 'EMP-1004', 'permanent', '2021-09-15', NULL, 'Tier 3 (Mid-level)', 'full_time', '/documents/contracts/CT-1004.pdf', 'active'),
('CT-1005', 'EMP-1005', 'permanent', '2020-12-01', NULL, 'Tier 4 (Senior)', 'full_time', '/documents/contracts/CT-1005.pdf', 'active'),
('CT-1006', 'EMP-1006', 'permanent', '2022-07-20', NULL, 'Tier 2 (Junior)', 'full_time', '/documents/contracts/CT-1006.pdf', 'active'),
('CT-2001', 'EMP-2001', 'permanent', '2019-04-10', NULL, 'Tier 5 (Management)', 'full_time', '/documents/contracts/CT-2001.pdf', 'active'),
('CT-3001', 'EMP-3001', 'permanent', '2018-02-28', NULL, 'Tier 5 (Management)', 'full_time', '/documents/contracts/CT-3001.pdf', 'active'),
('CT-4001', 'EMP-4001', 'permanent', '2019-10-15', NULL, 'Tier 5 (Management)', 'full_time', '/documents/contracts/CT-4001.pdf', 'active'),
('CT-5001', 'EMP-5001', 'permanent', '2020-03-25', NULL, 'Tier 4 (Senior)', 'full_time', '/documents/contracts/CT-5001.pdf', 'active');

-- =================================================================
-- 13. SAMPLE ATTENDANCE RECORDS (Last 7 days)
-- =================================================================

INSERT INTO attendance_records (employee_id, attendance_date, shift_start, check_in, check_out, shift_end, status, work_hours, overtime_minutes, late_minutes, notes) VALUES
-- Today's attendance
('EMP-1001', '2024-02-28', '09:00:00', '08:55:00', '17:30:00', '18:00:00', 'present', 8.5, 30, 0, NULL),
('EMP-1002', '2024-02-28', '09:00:00', '09:15:00', '17:45:00', '18:00:00', 'late', 8.5, 0, 15, NULL),
('EMP-1003', '2024-02-28', '09:00:00', '08:45:00', '17:15:00', '18:00:00', 'present', 8.5, 0, 0, NULL),
('EMP-1004', '2024-02-28', '09:00:00', '09:00:00', '17:00:00', '18:00:00', 'present', 8.0, 0, 0, NULL),
('EMP-1005', '2024-02-28', '09:00:00', '08:50:00', '19:00:00', '18:00:00', 'present', 10.0, 60, 0, NULL),
('EMP-1006', '2024-02-28', '09:00:00', '09:05:00', '17:35:00', '18:00:00', 'present', 8.5, 0, 5, NULL),

-- Yesterday
('EMP-1001', '2024-02-27', '09:00:00', '08:58:00', '17:20:00', '18:00:00', 'present', 8.3, 0, 0, NULL),
('EMP-1002', '2024-02-27', '09:00:00', '09:00:00', '17:30:00', '18:00:00', 'present', 8.5, 0, 0, NULL),
('EMP-1003', '2024-02-27', '09:00:00', '08:50:00', '17:10:00', '18:00:00', 'present', 8.3, 0, 0, NULL),
('EMP-1004', '2024-02-27', '09:00:00', '09:20:00', '17:20:00', '18:00:00', 'late', 8.0, 0, 20, NULL),
('EMP-1005', '2024-02-27', '09:00:00', '08:45:00', '18:15:00', '18:00:00', 'present', 9.5, 15, 0, NULL),
('EMP-1006', '2024-02-27', '09:00:00', '09:10:00', '17:40:00', '18:00:00', 'late', 8.5, 0, 10, NULL),

-- Last week sample
('EMP-1001', '2024-02-26', '09:00:00', '09:00:00', '17:00:00', '18:00:00', 'present', 8.0, 0, 0, NULL),
('EMP-1002', '2024-02-26', '09:00:00', '08:55:00', '17:05:00', '18:00:00', 'present', 8.1, 0, 0, NULL),
('EMP-1003', '2024-02-26', '09:00:00', '09:30:00', '17:30:00', '18:00:00', 'late', 8.0, 0, 30, NULL),
('EMP-1004', '2024-02-26', '09:00:00', '08:45:00', '17:15:00', '18:00:00', 'present', 8.5, 0, 0, NULL),
('EMP-1005', '2024-02-26', '09:00:00', '09:00:00', '18:30:00', '18:00:00', 'present', 9.5, 30, 0, NULL),
('EMP-1006', '2024-02-26', '09:00:00', '08:50:00', '17:20:00', '18:00:00', 'present', 8.5, 0, 0, NULL);

-- =================================================================
-- 14. SAMPLE ATTENDANCE EXCEPTIONS
-- =================================================================

INSERT INTO attendance_exceptions (employee_id, attendance_date, exception_type, reason, status, approved_by, approved_at) VALUES
('EMP-1002', '2024-02-28', 'late_arrival', 'Traffic delay', 'approved', 'EMP-1001', '2024-02-28 10:00:00'),
('EMP-1004', '2024-02-27', 'late_arrival', 'Public transport delay', 'pending', NULL, NULL),
('EMP-1003', '2024-02-26', 'late_arrival', 'Medical appointment', 'approved', 'EMP-1001', '2024-02-26 11:00:00'),
('EMP-1006', '2024-02-27', 'late_arrival', 'Train delay', 'approved', 'EMP-1001', '2024-02-27 10:30:00');

-- =================================================================
-- 15. SAMPLE PAYROLL CYCLES
-- =================================================================

INSERT INTO payroll_cycles (cycle_name, start_date, end_date, status, total_employees, total_cost, ot_cost) VALUES
('January 2024 Payroll', '2024-01-01', '2024-01-31', 'paid', 10, 85000.00, 1200.00),
('February 2024 Payroll', '2024-02-01', '2024-02-29', 'validated', 10, 87500.00, 1500.00),
('March 2024 Payroll', '2024-03-01', '2024-03-31', 'draft', 10, 0.00, 0.00);

-- =================================================================
-- 16. SAMPLE PAYROLL RESULTS
-- =================================================================

INSERT INTO payroll_results (cycle_id, employee_id, base_salary, allowances, deductions, overtime_hours, overtime_pay, gross_salary, tax, insurance, net_salary, status) VALUES
-- January 2024 Payroll (Paid)
(1, 'EMP-1001', 10000.00, 1800.00, 1200.00, 8.0, 300.00, 12100.00, 2400.00, 400.00, 9300.00, 'paid'),
(1, 'EMP-1002', 7916.67, 1200.00, 950.00, 4.0, 150.00, 9266.67, 1853.33, 350.00, 7063.34, 'paid'),
(1, 'EMP-1003', 7083.33, 950.00, 800.00, 2.0, 75.00, 8108.33, 1621.67, 300.00, 6186.66, 'paid'),
(1, 'EMP-1004', 6250.00, 150.00, 700.00, 0.0, 0.00, 6400.00, 1280.00, 300.00, 4820.00, 'paid'),
(1, 'EMP-1005', 7500.00, 1100.00, 900.00, 6.0, 225.00, 8825.00, 1765.00, 350.00, 6710.00, 'paid'),
(1, 'EMP-1006', 5416.67, 100.00, 550.00, 0.0, 0.00, 5516.67, 1103.33, 250.00, 4163.34, 'paid'),

-- February 2024 Payroll (Validated)
(2, 'EMP-1001', 10000.00, 1800.00, 1200.00, 10.0, 375.00, 12175.00, 2435.00, 400.00, 9340.00, 'validated'),
(2, 'EMP-1002', 7916.67, 1200.00, 950.00, 3.0, 112.50, 9279.17, 1855.83, 350.00, 7073.34, 'validated'),
(2, 'EMP-1003', 7083.33, 950.00, 800.00, 5.0, 187.50, 8220.83, 1644.17, 300.00, 6276.66, 'validated'),
(2, 'EMP-1004', 6250.00, 150.00, 700.00, 0.0, 0.00, 6400.00, 1280.00, 300.00, 4820.00, 'validated'),
(2, 'EMP-1005', 7500.00, 1100.00, 900.00, 8.0, 300.00, 8900.00, 1780.00, 350.00, 6770.00, 'validated'),
(2, 'EMP-1006', 5416.67, 100.00, 550.00, 0.0, 0.00, 5516.67, 1103.33, 250.00, 4163.34, 'validated');

-- =================================================================
-- 17. SAMPLE REQUESTS
-- =================================================================

INSERT INTO requests (request_code, employee_id, workflow_id, title, description, current_step, status, priority, submitted_at) VALUES
('REQ-001', 'EMP-1002', 1, 'Annual Leave Request', 'Request for 5 days annual leave from March 15-19, 2024', 1, 'approved', 'medium', '2024-02-20 09:00:00'),
('REQ-002', 'EMP-1003', 2, 'Business Travel Expense', 'Reimbursement for business trip to San Francisco', 2, 'approved', 'medium', '2024-02-18 14:30:00'),
('REQ-003', 'EMP-1004', 1, 'Sick Leave', 'Sick leave for 2 days due to medical reasons', 1, 'pending', 'high', '2024-02-28 08:00:00'),
('REQ-004', 'EMP-1005', 2, 'Training Expense', 'Request for training course reimbursement', 1, 'pending', 'low', '2024-02-25 16:00:00'),
('REQ-005', 'EMP-1006', 1, 'Personal Leave', 'Personal leave for family emergency', 1, 'approved', 'high', '2024-02-22 10:15:00');

-- =================================================================
-- 18. SAMPLE REQUEST_APPROVALS
-- =================================================================

INSERT INTO request_approvals (request_id, step_id, approver_id, status, comments, approved_at) VALUES
-- REQ-001 (Annual Leave - Approved)
(1, 1, 'EMP-1001', 'approved', 'Approved for annual leave. Team coverage arranged.', '2024-02-20 10:30:00'),
(1, 2, 'EMP-2001', 'approved', 'Leave recorded in system. Enjoy your time off!', '2024-02-20 11:15:00'),

-- REQ-002 (Business Travel - Approved)
(2, 1, 'EMP-1001', 'approved', 'Business trip approved. Submit receipts for reimbursement.', '2024-02-18 15:00:00'),
(2, 2, 'EMP-3001', 'approved', 'Expenses verified and approved for payment.', '2024-02-19 09:30:00'),

-- REQ-003 (Sick Leave - Pending Manager Approval)
(3, 1, 'EMP-1001', 'pending', 'Awaiting medical certificate for sick leave.', NULL),

-- REQ-004 (Training Expense - Pending Manager Approval)
(4, 1, 'EMP-1001', 'pending', 'Training budget review in progress.', NULL),

-- REQ-005 (Personal Leave - Approved)
(5, 1, 'EMP-1001', 'approved', 'Emergency leave approved. Hope everything is okay.', '2024-02-22 11:00:00'),
(5, 2, 'EMP-2001', 'approved', 'Leave recorded. Take care of family matters.', '2024-02-22 14:00:00');

-- =================================================================
-- 19. SAMPLE SYSTEM_ALERTS
-- =================================================================

INSERT INTO system_alerts (alert_type, title, message, severity, is_ai_generated, related_entity_type, related_entity_id, status, created_at) VALUES
('attendance', 'High Overtime Detected', 'Mike Johnson has worked 60+ overtime hours this month', 'medium', TRUE, 'employee', 'EMP-1005', 'active', '2024-02-28 09:00:00'),
('payroll', 'Payroll Processing Delay', 'February payroll validation is 2 days behind schedule', 'high', FALSE, 'payroll_cycle', '2', 'active', '2024-02-28 08:30:00'),
('contract', 'Contract Expiring Soon', '3 employee contracts expiring in next 30 days', 'medium', TRUE, 'employee', 'multiple', 'active', '2024-02-27 10:00:00'),
('attendance', 'Missing Check-outs', '5 employees missing check-out records this week', 'medium', TRUE, 'attendance', 'multiple', 'active', '2024-02-28 07:00:00'),
('system', 'Database Performance', 'Query response time increased by 25%', 'low', TRUE, 'system', 'performance', 'acknowledged', '2024-02-28 06:00:00');

-- =================================================================
-- 20. SAMPLE AI_INSIGHTS
-- =================================================================

INSERT INTO ai_insights (insight_type, title, description, recommendation, confidence_score, target_audience, department_id, related_data, status, created_at) VALUES
('cost_trend', 'Overtime Cost Increase', 'Engineering department overtime costs increased 15% in February', 'Consider redistributing workload or hiring additional resources', 0.85, 'hr_admin', 1, '{"department": "Engineering", "increase_percent": 15, "cost_impact": 2500}', 'active', '2024-02-28 08:00:00'),
('anomaly', 'Unusual Attendance Pattern', 'Jane Doe shows consistent late arrival pattern on Mondays', 'Schedule meeting to discuss potential scheduling issues', 0.72, 'manager', 1, '{"employee": "Jane Doe", "pattern": "Monday late arrivals", "frequency": "4/4 weeks"}', 'active', '2024-02-27 14:00:00'),
('optimization', 'Leave Balance Optimization', '30% of employees have unused annual leave', 'Encourage leave usage to prevent burnout and improve work-life balance', 0.68, 'hr_admin', NULL, '{"employees_with_excess_leave": "30%", "total_unused_days": 45}', 'active', '2024-02-26 10:00:00'),
('prediction', 'Turnover Risk Prediction', '3 employees in Engineering show high turnover risk indicators', 'Proactive engagement and retention strategies recommended', 0.78, 'hr_admin', 1, '{"risk_employees": 3, "risk_factors": ["low engagement", "high overtime", "recent complaints"]}', 'active', '2024-02-25 16:00:00');

-- =================================================================
-- 21. SAMPLE AUDIT_LOG
-- =================================================================

INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) VALUES
(1, 'INSERT', 'employees', 'EMP-1006', NULL, '{"first_name": "Emily", "last_name": "Chen", "position": "Junior Software Engineer"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'UPDATE', 'employee_positions', '2', '{"is_current": false}', '{"is_current": true}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(3, 'INSERT', 'requests', 'REQ-003', NULL, '{"title": "Sick Leave", "employee_id": "EMP-1004"}', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'UPDATE', 'users', '1', '{"last_login": "2024-02-27 09:00:00"}', '{"last_login": "2024-02-28 09:00:00"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'INSERT', 'attendance_records', '12345', NULL, '{"employee_id": "EMP-1002", "attendance_date": "2024-02-28", "status": "late"}', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Check data insertion summary
SELECT 
    'Roles' as table_name, COUNT(*) as record_count FROM roles
UNION ALL
SELECT 
    'Users', COUNT(*) FROM users
UNION ALL
SELECT 
    'User_Roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 
    'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 
    'Positions', COUNT(*) FROM positions
UNION ALL
SELECT 
    'Employees', COUNT(*) FROM employees
UNION ALL
SELECT 
    'Employee_Positions', COUNT(*) FROM employee_positions
UNION ALL
SELECT 
    'Compensation_Plans', COUNT(*) FROM compensation_plans
UNION ALL
SELECT 
    'Salary_Components', COUNT(*) FROM salary_components
UNION ALL
SELECT 
    'Workflows', COUNT(*) FROM workflows
UNION ALL
SELECT 
    'Workflow_Steps', COUNT(*) FROM workflow_steps
UNION ALL
SELECT 
    'Contracts', COUNT(*) FROM contracts
UNION ALL
SELECT 
    'Attendance_Records', COUNT(*) FROM attendance_records
UNION ALL
SELECT 
    'Attendance_Exceptions', COUNT(*) FROM attendance_exceptions
UNION ALL
SELECT 
    'Payroll_Cycles', COUNT(*) FROM payroll_cycles
UNION ALL
SELECT 
    'Payroll_Results', COUNT(*) FROM payroll_results
UNION ALL
SELECT 
    'Requests', COUNT(*) FROM requests
UNION ALL
SELECT 
    'Request_Approvals', COUNT(*) FROM request_approvals
UNION ALL
SELECT 
    'System_Alerts', COUNT(*) FROM system_alerts
UNION ALL
SELECT 
    'AI_Insights', COUNT(*) FROM ai_insights
UNION ALL
SELECT 
    'Audit_Log', COUNT(*) FROM audit_log;

-- Sample query to test the user_with_roles view
SELECT * FROM user_with_roles;

-- Sample query to test employee_current_position view
SELECT * FROM employee_current_position LIMIT 5;

-- Sample query to check attendance summary
SELECT employee_id, COUNT(*) as days_present, 
       SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
       SUM(overtime_minutes) as total_overtime_minutes
FROM attendance_records 
WHERE attendance_date >= '2024-02-01'
GROUP BY employee_id
ORDER BY employee_id;

-- =================================================================
-- END OF SAMPLE DATA INSERTION
-- =================================================================
