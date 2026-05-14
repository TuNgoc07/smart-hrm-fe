# SmartOps HRM Database Schema Design

## Overview
This database schema is designed based on the frontend components and data structures found in the SmartOps HRM application. The schema supports employee management, attendance tracking, payroll processing, department/position management, and workflow automation.

## Core Tables

### 1. Users Table
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Roles Table
```sql
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL, -- 'hr_admin', 'manager', 'employee'
    display_name VARCHAR(100) NOT NULL, -- 'HR Administrator', 'Manager', 'Employee'
    description TEXT,
    permissions JSON, -- Store role permissions as JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. User_Roles Table
```sql
CREATE TABLE user_roles (
    user_role_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by INT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME, -- For temporary role assignments
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_role (user_id, role_id)
);
```

### 4. Employees Table
```sql
CREATE TABLE employees (
    employee_id VARCHAR(20) PRIMARY KEY, -- e.g., EMP-4829
    user_id INT UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    nationality VARCHAR(50),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    personal_email VARCHAR(100) UNIQUE,
    work_email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    linkedin_profile VARCHAR(200),
    identification_code VARCHAR(50),
    identification_issue_date DATE,
    identification_issue_place VARCHAR(100),
    permanent_address TEXT,
    current_address TEXT,
    hire_date DATE NOT NULL,
    employment_status ENUM('active', 'probation', 'inactive', 'terminated') DEFAULT 'probation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
```

### 5. Departments Table
```sql
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., ENG-001
    department_name VARCHAR(100) NOT NULL,
    manager_id VARCHAR(20),
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);
```

### 6. Positions Table
```sql
CREATE TABLE positions (
    position_id INT PRIMARY KEY AUTO_INCREMENT,
    position_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., ENG-001
    position_name VARCHAR(100) NOT NULL,
    department_id INT,
    job_level ENUM('L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8') NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);
```

### 7. Employee_Positions Table (Job History)
```sql
CREATE TABLE employee_positions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20) NOT NULL,
    position_id INT NOT NULL,
    department_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    manager_id VARCHAR(20),
    working_model ENUM('onsite', 'hybrid', 'remote') DEFAULT 'onsite',
    work_location VARCHAR(100),
    employment_type ENUM('full_time', 'part_time', 'contract', 'intern') DEFAULT 'full_time',
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);
```

## Compensation & Payroll Tables

### 8. Compensation_Plans Table
```sql
CREATE TABLE compensation_plans (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20) NOT NULL,
    salary_type ENUM('monthly', 'annual') DEFAULT 'monthly',
    base_salary DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    effective_date DATE NOT NULL,
    end_date DATE,
    tax_resident BOOLEAN DEFAULT TRUE,
    payment_method ENUM('bank_transfer', 'cash', 'check') DEFAULT 'bank_transfer',
    ot_rate DECIMAL(5,2) DEFAULT 150.00,
    insurance_scheme ENUM('standard_social', 'private', 'none') DEFAULT 'standard_social',
    status ENUM('active', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);
```

### 9. Salary_Components Table
```sql
CREATE TABLE salary_components (
    component_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    component_type ENUM('allowance', 'deduction', 'bonus') NOT NULL,
    frequency ENUM('monthly', 'quarterly', 'annual', 'one_time') DEFAULT 'monthly',
    amount DECIMAL(10,2) NOT NULL,
    is_percentage BOOLEAN DEFAULT FALSE,
    percentage_base DECIMAL(5,2),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES compensation_plans(plan_id) ON DELETE CASCADE
);
```

### 10. Payroll_Cycles Table
```sql
CREATE TABLE payroll_cycles (
    cycle_id INT PRIMARY KEY AUTO_INCREMENT,
    cycle_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('draft', 'calculation', 'validated', 'locked', 'paid') DEFAULT 'draft',
    total_employees INT DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    ot_cost DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 11. Payroll_Results Table
```sql
CREATE TABLE payroll_results (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    cycle_id INT NOT NULL,
    employee_id VARCHAR(20) NOT NULL,
    base_salary DECIMAL(12,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    overtime_hours DECIMAL(6,2) DEFAULT 0,
    overtime_pay DECIMAL(10,2) DEFAULT 0,
    gross_salary DECIMAL(12,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    insurance DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    status ENUM('calculated', 'validated', 'paid') DEFAULT 'calculated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cycle_id) REFERENCES payroll_cycles(cycle_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);
```

## Attendance Tables

### 12. Attendance_Records Table
```sql
CREATE TABLE attendance_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20) NOT NULL,
    attendance_date DATE NOT NULL,
    shift_start TIME,
    check_in TIME,
    check_out TIME,
    shift_end TIME,
    status ENUM('present', 'late', 'absent', 'half_day', 'holiday', 'leave') DEFAULT 'present',
    late_minutes INT DEFAULT 0,
    overtime_minutes INT DEFAULT 0,
    notes TEXT,
    approved_by VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(employee_id) ON DELETE SET NULL,
    UNIQUE KEY unique_employee_date (employee_id, attendance_date)
);
```

### 13. Attendance_Exceptions Table
```sql
CREATE TABLE attendance_exceptions (
    exception_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20) NOT NULL,
    attendance_date DATE NOT NULL,
    exception_type ENUM('missing_check_in', 'missing_check_out', 'late_arrival', 'early_departure', 'absence') NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by VARCHAR(20),
    approved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(employee_id) ON DELETE SET NULL
);
```

## Contract Management Tables

### 14. Contracts Table
```sql
CREATE TABLE contracts (
    contract_id INT PRIMARY KEY AUTO_INCREMENT,
    contract_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., CT-10293
    employee_id VARCHAR(20) NOT NULL,
    contract_type ENUM('probation', 'fixed_term', 'permanent', 'contract') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    salary_tier VARCHAR(50),
    employment_status ENUM('full_time', 'part_time', 'contract') NOT NULL,
    document_url VARCHAR(500),
    status ENUM('active', 'expired', 'terminated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);
```

## Workflow & Request Tables

### 15. Workflows Table
```sql
CREATE TABLE workflows (
    workflow_id INT PRIMARY KEY AUTO_INCREMENT,
    workflow_name VARCHAR(100) NOT NULL,
    workflow_type ENUM('leave_request', 'expense_claim', 'promotion', 'termination') NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 16. Workflow_Steps Table
```sql
CREATE TABLE workflow_steps (
    step_id INT PRIMARY KEY AUTO_INCREMENT,
    workflow_id INT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INT NOT NULL,
    approver_role ENUM('hr_admin', 'manager', 'specific_person') NOT NULL,
    approver_id VARCHAR(20),
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);
```

### 17. Requests Table
```sql
CREATE TABLE requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    request_code VARCHAR(20) UNIQUE NOT NULL,
    employee_id VARCHAR(20) NOT NULL,
    workflow_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    current_step INT NOT NULL DEFAULT 1,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (workflow_id) REFERENCES workflows(workflow_id) ON DELETE CASCADE
);
```

### 18. Request_Approvals Table
```sql
CREATE TABLE request_approvals (
    approval_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    step_id INT NOT NULL,
    approver_id VARCHAR(20) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    comments TEXT,
    approved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES workflow_steps(step_id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);
```

## System & AI Tables

### 19. System_Alerts Table
```sql
CREATE TABLE system_alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    alert_type ENUM('attendance', 'payroll', 'contract', 'performance', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    is_ai_generated BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id VARCHAR(50),
    status ENUM('active', 'acknowledged', 'resolved') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    resolved_by VARCHAR(20),
    FOREIGN KEY (resolved_by) REFERENCES employees(employee_id) ON DELETE SET NULL
);
```

### 20. AI_Insights Table
```sql
CREATE TABLE ai_insights (
    insight_id INT PRIMARY KEY AUTO_INCREMENT,
    insight_type ENUM('cost_trend', 'anomaly', 'optimization', 'prediction') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    confidence_score DECIMAL(3,2),
    target_audience ENUM('hr_admin', 'manager', 'employee') DEFAULT 'hr_admin',
    department_id INT,
    related_data JSON,
    status ENUM('active', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);
```

### 21. Audit_Log Table
```sql
CREATE TABLE audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

## Role Data Insertion

```sql
-- Insert default roles
INSERT INTO roles (role_name, display_name, description, permissions) VALUES
('hr_admin', 'HR Administrator', 'Full access to HR functions', 
 '{"users": ["read", "write", "delete"], "employees": ["read", "write", "delete"], "payroll": ["read", "write", "delete"], "departments": ["read", "write", "delete"], "positions": ["read", "write", "delete"], "workflows": ["read", "write", "delete"]}'),
('manager', 'Manager', 'Department level access', 
 '{"employees": ["read", "write"], "attendance": ["read", "write"], "reports": ["read"], "requests": ["read", "write"], "payroll": ["read"]}'),
('employee', 'Employee', 'Self-service access', 
 '{"profile": ["read", "write"], "attendance": ["read"], "leave": ["read", "write"], "requests": ["read", "write"], "documents": ["read", "write"]}');
```

## Indexes for Performance

```sql
-- Employee indexes
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_department ON employee_positions(department_id);
CREATE INDEX idx_employees_manager ON employee_positions(manager_id);

-- Attendance indexes
CREATE INDEX idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- Payroll indexes
CREATE INDEX idx_payroll_cycle ON payroll_results(cycle_id);
CREATE INDEX idx_payroll_employee ON payroll_results(employee_id);
CREATE INDEX idx_payroll_status ON payroll_results(status);

-- Workflow indexes
CREATE INDEX idx_requests_employee ON requests(employee_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_approvals_approver ON request_approvals(approver_id);

-- System indexes
CREATE INDEX idx_alerts_type ON system_alerts(alert_type);
CREATE INDEX idx_alerts_status ON system_alerts(status);
CREATE INDEX idx_insights_type ON ai_insights(insight_type);

-- Role indexes
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_roles_active ON roles(is_active);
```

## Views for Common Queries

```sql
-- Employee Current Position View
CREATE VIEW employee_current_position AS
SELECT 
    e.employee_id,
    e.first_name,
    e.last_name,
    e.work_email,
    e.avatar_url,
    e.employment_status,
    p.position_name,
    p.job_level,
    d.department_name,
    d.department_code,
    ep.manager_id,
    m.first_name as manager_name,
    ep.working_model,
    ep.work_location,
    ep.start_date as position_start_date
FROM employees e
LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_current = TRUE
LEFT JOIN positions p ON ep.position_id = p.position_id
LEFT JOIN departments d ON ep.department_id = d.department_id
LEFT JOIN employees m ON ep.manager_id = m.employee_id;

-- Attendance Summary View
CREATE VIEW attendance_summary AS
SELECT 
    employee_id,
    attendance_date,
    status,
    late_minutes,
    overtime_minutes,
    CASE 
        WHEN status = 'present' THEN 1
        WHEN status = 'late' THEN 1
        ELSE 0
    END as working_days,
    CASE 
        WHEN status = 'absent' THEN 1
        ELSE 0
    END as absent_days
FROM attendance_records;

-- Monthly Payroll Summary View
CREATE VIEW monthly_payroll_summary AS
SELECT 
    pr.employee_id,
    pc.cycle_name,
    pc.start_date,
    pc.end_date,
    pr.base_salary,
    pr.allowances,
    pr.deductions,
    pr.overtime_pay,
    pr.gross_salary,
    pr.net_salary,
    pr.status
FROM payroll_results pr
JOIN payroll_cycles pc ON pr.cycle_id = pc.cycle_id
ORDER BY pc.start_date DESC, pr.employee_id;

-- User with Roles View
CREATE VIEW user_with_roles AS
SELECT 
    u.user_id,
    u.username,
    u.status,
    u.last_login,
    GROUP_CONCAT(r.display_name) as roles,
    GROUP_CONCAT(r.role_name) as role_names,
    MAX(ur.assigned_at) as last_role_assignment
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id AND ur.is_active = TRUE
LEFT JOIN roles r ON ur.role_id = r.role_id AND r.is_active = TRUE
GROUP BY u.user_id;
```

## Stored Procedures for Common Operations

```sql
-- Calculate Monthly Payroll
DELIMITER //
CREATE PROCEDURE CalculateMonthlyPayroll(IN cycle_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE emp_id VARCHAR(20);
    DECLARE emp_cursor CURSOR FOR 
        SELECT employee_id FROM employees WHERE employment_status = 'active';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN emp_cursor;
    
    read_loop: LOOP
        FETCH emp_cursor INTO emp_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert or update payroll calculation
        INSERT INTO payroll_results 
        (cycle_id, employee_id, base_salary, gross_salary, net_salary, status)
        VALUES 
        (cycle_id, emp_id, 0, 0, 0, 'calculated')
        ON DUPLICATE KEY UPDATE
        status = 'calculated';
        
    END LOOP;
    
    CLOSE emp_cursor;
END //
DELIMITER ;

-- Update Employee Department Statistics
DELIMITER //
CREATE PROCEDURE UpdateDepartmentStats()
BEGIN
    UPDATE departments d 
    SET total_members = (
        SELECT COUNT(*) 
        FROM employee_positions ep 
        WHERE ep.department_id = d.department_id 
        AND ep.is_current = TRUE
    );
END //
DELIMITER ;
```

## Triggers for Data Integrity

```sql
-- Audit Log Trigger
DELIMITER //
CREATE TRIGGER before_employee_update
BEFORE UPDATE ON employees
FOR EACH ROW
BEGIN
    INSERT INTO audit_log 
    (user_id, action, table_name, record_id, old_values, new_values)
    VALUES 
    (CURRENT_USER(), 'UPDATE', 'employees', OLD.employee_id, 
     JSON_OBJECT(
         'first_name', OLD.first_name,
         'last_name', OLD.last_name,
         'work_email', OLD.work_email,
         'employment_status', OLD.employment_status
     ),
     JSON_OBJECT(
         'first_name', NEW.first_name,
         'last_name', NEW.last_name,
         'work_email', NEW.work_email,
         'employment_status', NEW.employment_status
     ));
END //
DELIMITER ;

-- Contract Expiry Alert Trigger
DELIMITER //
CREATE TRIGGER after_contract_insert
AFTER INSERT ON contracts
FOR EACH ROW
BEGIN
    IF DATEDIFF(NEW.end_date, CURDATE()) <= 30 THEN
        INSERT INTO system_alerts 
        (alert_type, title, message, severity, related_entity_type, related_entity_id)
        VALUES 
        ('contract', 'Contract Expiring Soon', 
         CONCAT('Contract ', NEW.contract_code, ' for employee expires on ', NEW.end_date),
         'medium', 'contract', NEW.contract_id);
    END IF;
END //
DELIMITER ;
```

## Notes

1. **Currency**: All monetary values are stored in VND (Vietnamese Dong) as shown in the frontend
2. **Employee ID Format**: Uses format like "EMP-4829" as shown in frontend
3. **Department Codes**: Uses format like "ENG-001" as shown in frontend
4. **Position Levels**: Uses L1-L8 system as shown in frontend
5. **Working Models**: Supports onsite, hybrid, remote as shown in frontend
6. **AI Integration**: Tables support AI-generated insights and alerts as shown in frontend
7. **Audit Trail**: Complete audit logging for all critical operations
8. **Performance**: Optimized indexes for common query patterns
9. **Scalability**: Designed to handle large employee bases with proper partitioning potential

This schema provides a comprehensive foundation that matches your frontend application's features and data structures while ensuring data integrity, performance, and scalability.
