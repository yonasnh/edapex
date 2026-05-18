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
  TextInput,
  TextArea,
  DatePicker,
  DatePickerInput,
  Dropdown,
  Toggle,
} from '@carbon/react';
import {
  Add,
  View,
  Edit,
  Settings,
  User,
  Assignment,
  Analytics,
  Calendar,
  Launch,
} from '@carbon/icons-react';
import { GET_COURSES, GET_COURSE } from '../graphql/queries';

const Courses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const { data, loading, error, refetch } = useQuery(GET_COURSES, {
    variables: { 
      limit: pageSize, 
      offset: (currentPage - 1) * pageSize 
    }
  });

  const { data: courseData, loading: courseLoading } = useQuery(GET_COURSE, {
    variables: { id: selectedCourse?.id },
    skip: !selectedCourse?.id
  });

  if (loading) {
    return (
      <div className="loading-spinner">
        <Loading description="Loading courses..." />
      </div>
    );
  }

  if (error) {
    return (
      <InlineNotification
        kind="error"
        title="Error loading courses"
        subtitle={error.message}
        hideCloseButton
      />
    );
  }

  const courses = data?.courses || [];
  const filteredCourses = courses.filter((course: any) =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableHeaders = [
    { key: 'name', header: 'Course Name' },
    { key: 'courseCode', header: 'Course Code' },
    { key: 'status', header: 'Status' },
    { key: 'students', header: 'Students' },
    { key: 'assignments', header: 'Assignments' },
    { key: 'teachers', header: 'Teachers' },
    { key: 'actions', header: 'Actions' },
  ];

  const tableRows = filteredCourses.map((course: any) => ({
    id: course.id,
    name: course.name || 'Untitled Course',
    courseCode: course.courseCode || 'N/A',
    status: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Tag type={course.isPublished ? 'green' : 'gray'}>
          {course.isPublished ? 'Published' : 'Draft'}
        </Tag>
        {course.isActive && <Tag type="blue">Active</Tag>}
      </div>
    ),
    students: course.studentCount || 0,
    assignments: course.assignmentCount || 0,
    teachers: course.teacherCount || 0,
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={View}
          onClick={() => {
            setSelectedCourse(course);
            setIsModalOpen(true);
          }}
        >
          View
        </Button>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Launch}
          onClick={() => window.open(`http://localhost:3000/courses/${course.id}`, '_blank')}
        >
          Canvas
        </Button>
      </div>
    ),
  }));

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
              Courses
            </h1>
            <p style={{ color: '#6f6f6f', margin: 0 }}>
              Manage and view all courses with real Canvas data integration
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
              onClick={() => window.open('http://localhost:3000/courses/new', '_blank')}
            >
              Create Course
            </Button>
          </div>
        </div>

        {/* Search and Controls */}
        <Grid>
          <Column lg={8} md={6} sm={4}>
            <Search
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="lg"
            />
          </Column>
          <Column lg={4} md={2} sm={4}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Toggle
                id="view-mode"
                labelText="Table View"
                toggled={viewMode === 'table'}
                onToggle={(toggled) => setViewMode(toggled ? 'table' : 'grid')}
              />
              <Button
                kind="ghost"
                renderIcon={Settings}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </div>
          </Column>
        </Grid>
      </div>

      {/* Course Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <h4>{courses.length}</h4>
          <p>Total Courses</p>
        </div>
        <div className="stat-card">
          <h4>{courses.filter((c: any) => c.isPublished).length}</h4>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <h4>{courses.filter((c: any) => c.isActive).length}</h4>
          <p>Active</p>
        </div>
        <div className="stat-card">
          <h4>{courses.reduce((sum: number, c: any) => sum + (c.studentCount || 0), 0)}</h4>
          <p>Total Students</p>
        </div>
      </div>

      {/* Courses Display */}
      {viewMode === 'grid' ? (
        <div className="course-grid">
          {filteredCourses.map((course: any) => (
            <Tile key={course.id} className="course-card">
              <div className="course-card-header">
                <h4>{course.name || 'Untitled Course'}</h4>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
                  {course.courseCode || 'No Code'}
                </p>
              </div>
              <div className="course-card-body">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <Tag type={course.isPublished ? 'green' : 'gray'}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Tag>
                  {course.isActive && <Tag type="blue">Active</Tag>}
                  {course.startAt && (
                    <Tag type="purple">
                      Started {new Date(course.startAt).toLocaleDateString()}
                    </Tag>
                  )}
                </div>
                
                <div className="course-stats">
                  <span><User size={16} /> {course.studentCount || 0} students</span>
                  <span><Assignment size={16} /> {course.assignmentCount || 0} assignments</span>
                  <span><Calendar size={16} /> {course.teacherCount || 0} teachers</span>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <Button
                    kind="primary"
                    size="sm"
                    renderIcon={View}
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsModalOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    kind="secondary"
                    size="sm"
                    renderIcon={Launch}
                    onClick={() => window.open(`http://localhost:3000/courses/${course.id}`, '_blank')}
                  >
                    Open in Canvas
                  </Button>
                </div>
              </div>
            </Tile>
          ))}
        </div>
      ) : (
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
            totalItems={courses.length}
            pageSize={pageSize}
            pageSizes={[5, 10, 20, 50]}
            onChange={({ page, pageSize: newPageSize }) => {
              setCurrentPage(page);
              setPageSize(newPageSize);
            }}
          />
        </div>
      )}

      {/* Course Detail Modal */}
      <Modal
        open={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        modalHeading={selectedCourse?.name || 'Course Details'}
        modalLabel="Course Information"
        primaryButtonText="Open in Canvas"
        secondaryButtonText="Close"
        onRequestSubmit={() => {
          window.open(`http://localhost:3000/courses/${selectedCourse?.id}`, '_blank');
          setIsModalOpen(false);
        }}
        size="lg"
      >
        {courseLoading ? (
          <Loading description="Loading course details..." />
        ) : courseData?.course ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Grid>
              <Column lg={8} md={4} sm={4}>
                <div>
                  <h4>Course Information</h4>
                  <p><strong>Name:</strong> {courseData.course.name}</p>
                  <p><strong>Code:</strong> {courseData.course.courseCode || 'N/A'}</p>
                  <p><strong>Status:</strong> {courseData.course.isPublished ? 'Published' : 'Draft'}</p>
                  {courseData.course.startAt && (
                    <p><strong>Start Date:</strong> {new Date(courseData.course.startAt).toLocaleDateString()}</p>
                  )}
                  {courseData.course.concludeAt && (
                    <p><strong>End Date:</strong> {new Date(courseData.course.concludeAt).toLocaleDateString()}</p>
                  )}
                </div>
              </Column>
              <Column lg={8} md={4} sm={4}>
                <div>
                  <h4>Statistics</h4>
                  <p><strong>Students:</strong> {courseData.course.studentCount}</p>
                  <p><strong>Teachers:</strong> {courseData.course.teacherCount}</p>
                  <p><strong>Assignments:</strong> {courseData.course.assignmentCount}</p>
                  <p><strong>Created:</strong> {new Date(courseData.course.createdAt).toLocaleDateString()}</p>
                </div>
              </Column>
            </Grid>

            {courseData.course.publicDescription && (
              <div>
                <h4>Description</h4>
                <p>{courseData.course.publicDescription}</p>
              </div>
            )}

            {courseData.course.assignments?.length > 0 && (
              <div>
                <h4>Recent Assignments</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {courseData.course.assignments.slice(0, 5).map((assignment: any) => (
                    <div key={assignment.id} style={{ 
                      padding: '0.75rem', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>{assignment.title}</strong>
                        {assignment.dueAt && (
                          <span style={{ marginLeft: '1rem', color: '#6f6f6f' }}>
                            Due: {new Date(assignment.dueAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <Tag type={assignment.isOverdue ? 'red' : 'blue'}>
                        {assignment.pointsPossible} pts
                      </Tag>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>No course details available.</p>
        )}
      </Modal>
    </div>
  );
};

export default Courses;
