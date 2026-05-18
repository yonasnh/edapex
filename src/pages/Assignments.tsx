import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Grid,
  Column,
  Tile,
  Loading,
  InlineNotification,
  Button,
  Tag,
  Search,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
  Modal,
  ProgressBar,
  Dropdown,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import {
  Add,
  View,
  Edit,
  Calendar,
  CheckmarkFilled,
  WarningFilled,
  Time,
  User,
  Launch,
  Analytics,
} from '@carbon/icons-react';
import { GET_ASSIGNMENTS, GET_ASSIGNMENT } from '../graphql/queries';

const Assignments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data, loading, error, refetch } = useQuery(GET_ASSIGNMENTS, {
    variables: { 
      limit: pageSize, 
      offset: (currentPage - 1) * pageSize 
    }
  });

  const { data: assignmentData, loading: assignmentLoading } = useQuery(GET_ASSIGNMENT, {
    variables: { id: selectedAssignment?.id },
    skip: !selectedAssignment?.id
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <Loading description="Loading assignments..." />
      </div>
    );
  }

  if (error) {
    return (
      <InlineNotification
        kind="error"
        title="Error loading assignments"
        subtitle={error.message}
        hideCloseButton
      />
    );
  }

  const assignments = data?.assignments || [];
  const filteredAssignments = assignments.filter((assignment: any) => {
    const matchesSearch = assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'overdue') return matchesSearch && assignment.isOverdue;
    if (filterStatus === 'active') return matchesSearch && !assignment.isOverdue && assignment.isPublished;
    if (filterStatus === 'draft') return matchesSearch && !assignment.isPublished;
    
    return matchesSearch;
  });

  const getStatusTag = (assignment: any) => {
    if (!assignment.isPublished) return <Tag type="gray">Draft</Tag>;
    if (assignment.isOverdue) return <Tag type="red">Overdue</Tag>;
    return <Tag type="green">Active</Tag>;
  };

  const getCompletionRate = (assignment: any) => {
    if (!assignment.submissionCount || !assignment.course?.studentCount) return 0;
    return Math.round((assignment.submissionCount / assignment.course.studentCount) * 100);
  };

  const tableHeaders = [
    { key: 'title', header: 'Assignment' },
    { key: 'course', header: 'Course' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'status', header: 'Status' },
    { key: 'submissions', header: 'Submissions' },
    { key: 'completion', header: 'Completion' },
    { key: 'actions', header: 'Actions' },
  ];

  const tableRows = filteredAssignments.map((assignment: any) => ({
    id: assignment.id,
    title: (
      <div>
        <strong>{assignment.title || 'Untitled Assignment'}</strong>
        {assignment.pointsPossible && (
          <div style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
            {assignment.pointsPossible} points
          </div>
        )}
      </div>
    ),
    course: (
      <div>
        <div>{assignment.course?.name || 'Unknown Course'}</div>
        <div style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
          {assignment.course?.courseCode}
        </div>
      </div>
    ),
    dueDate: assignment.dueAt ? (
      <div>
        <div>{new Date(assignment.dueAt).toLocaleDateString()}</div>
        <div style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
          {new Date(assignment.dueAt).toLocaleTimeString()}
        </div>
      </div>
    ) : 'No due date',
    status: getStatusTag(assignment),
    submissions: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: '600' }}>{assignment.submissionCount || 0}</div>
        <div style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
          {assignment.gradedCount || 0} graded
        </div>
      </div>
    ),
    completion: (
      <div style={{ minWidth: '100px' }}>
        <ProgressBar 
          value={getCompletionRate(assignment)} 
          max={100}
          label={`${getCompletionRate(assignment)}%`}
          size="sm"
        />
      </div>
    ),
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={View}
          onClick={() => {
            setSelectedAssignment(assignment);
            setIsModalOpen(true);
          }}
        >
          View
        </Button>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Launch}
          onClick={() => window.open(`http://localhost:3000/courses/${assignment.contextId}/assignments/${assignment.id}`, '_blank')}
        >
          Canvas
        </Button>
      </div>
    ),
  }));

  const statusOptions = [
    { id: 'all', text: 'All Assignments' },
    { id: 'active', text: 'Active' },
    { id: 'overdue', text: 'Overdue' },
    { id: 'draft', text: 'Draft' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '300', 
              margin: '0 0 0.5rem 0',
              background: 'linear-gradient(135deg, #0f62fe 0%, #8a3ffc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Assignments
            </h1>
            <p style={{ color: '#6f6f6f', margin: 0 }}>
              Manage assignments across all courses with real-time Canvas data
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              kind="secondary"
              renderIcon={Analytics}
              onClick={() => window.location.href = '/analytics'}
            >
              View Analytics
            </Button>
            <Button
              kind="primary"
              renderIcon={Add}
              onClick={() => window.open('http://localhost:3000/courses', '_blank')}
            >
              Create Assignment
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Grid>
          <Column lg={6} md={4} sm={4}>
            <Search
              placeholder="Search assignments by title or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="lg"
            />
          </Column>
          <Column lg={4} md={2} sm={4}>
            <Dropdown
              id="status-filter"
              titleText="Filter by Status"
              label="Select status"
              items={statusOptions}
              selectedItem={statusOptions.find(opt => opt.id === filterStatus)}
              onChange={({ selectedItem }) => setFilterStatus(selectedItem?.id || 'all')}
            />
          </Column>
          <Column lg={6} md={2} sm={4}>
            <Button
              kind="ghost"
              onClick={() => refetch()}
              style={{ marginTop: '1rem' }}
            >
              Refresh Data
            </Button>
          </Column>
        </Grid>
      </div>

      {/* Assignment Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <h4>{assignments.length}</h4>
          <p>Total Assignments</p>
        </div>
        <div className="stat-card">
          <h4>{assignments.filter((a: any) => !a.isOverdue && a.isPublished).length}</h4>
          <p>Active</p>
        </div>
        <div className="stat-card">
          <h4>{assignments.filter((a: any) => a.isOverdue).length}</h4>
          <p>Overdue</p>
        </div>
        <div className="stat-card">
          <h4>{assignments.reduce((sum: number, a: any) => sum + (a.submissionCount || 0), 0)}</h4>
          <p>Total Submissions</p>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="dashboard-card">
        <DataTable rows={tableRows} headers={tableHeaders}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        
        <Pagination
          page={currentPage}
          totalItems={filteredAssignments.length}
          pageSize={pageSize}
          pageSizes={[5, 10, 20, 50]}
          onChange={({ page, pageSize: newPageSize }) => {
            setCurrentPage(page);
            setPageSize(newPageSize);
          }}
        />
      </div>

      {/* Assignment Detail Modal */}
      <Modal
        open={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        modalHeading={selectedAssignment?.title || 'Assignment Details'}
        modalLabel="Assignment Information"
        primaryButtonText="Open in Canvas"
        secondaryButtonText="Close"
        onRequestSubmit={() => {
          window.open(`http://localhost:3000/courses/${selectedAssignment?.contextId}/assignments/${selectedAssignment?.id}`, '_blank');
          setIsModalOpen(false);
        }}
        size="lg"
      >
        {assignmentLoading ? (
          <Loading description="Loading assignment details..." />
        ) : assignmentData?.assignment ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Grid>
              <Column lg={8} md={4} sm={4}>
                <div>
                  <h4>Assignment Details</h4>
                  <p><strong>Title:</strong> {assignmentData.assignment.title}</p>
                  <p><strong>Course:</strong> {assignmentData.assignment.course?.name}</p>
                  <p><strong>Points:</strong> {assignmentData.assignment.pointsPossible || 'Ungraded'}</p>
                  <p><strong>Type:</strong> {assignmentData.assignment.gradingType || 'Standard'}</p>
                  {assignmentData.assignment.dueAt && (
                    <p><strong>Due:</strong> {new Date(assignmentData.assignment.dueAt).toLocaleString()}</p>
                  )}
                </div>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <div>
                  <h4>Submission Statistics</h4>
                  <p><strong>Submissions:</strong> {assignmentData.assignment.submissionCount}</p>
                  <p><strong>Graded:</strong> {assignmentData.assignment.gradedCount}</p>
                  {assignmentData.assignment.averageScore && (
                    <p><strong>Average Score:</strong> {Math.round(assignmentData.assignment.averageScore * 100) / 100}</p>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    <ProgressBar 
                      value={getCompletionRate(assignmentData.assignment)} 
                      max={100}
                      label={`${getCompletionRate(assignmentData.assignment)}% completion rate`}
                    />
                  </div>
                </div>
              </Column>
            </Grid>

            {assignmentData.assignment.description && (
              <div>
                <h4>Description</h4>
                <div 
                  style={{ 
                    padding: '1rem', 
                    backgroundColor: '#f4f4f4', 
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}
                  dangerouslySetInnerHTML={{ __html: assignmentData.assignment.description }}
                />
              </div>
            )}

            {assignmentData.assignment.submissions?.length > 0 && (
              <div>
                <h4>Recent Submissions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflow: 'auto' }}>
                  {assignmentData.assignment.submissions.slice(0, 10).map((submission: any) => (
                    <div key={submission.id} style={{ 
                      padding: '0.75rem', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>{submission.user?.displayName || submission.user?.name}</strong>
                        {submission.submittedAt && (
                          <div style={{ fontSize: '0.875rem', color: '#6f6f6f' }}>
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {submission.isGraded ? (
                          <Tag type="green">
                            {submission.score || submission.grade || 'Graded'}
                          </Tag>
                        ) : submission.isSubmitted ? (
                          <Tag type="blue">Submitted</Tag>
                        ) : (
                          <Tag type="gray">Not Submitted</Tag>
                        )}
                        {submission.isLate && <Tag type="red">Late</Tag>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>No assignment details available.</p>
        )}
      </Modal>
    </div>
  );
};

export default Assignments;
