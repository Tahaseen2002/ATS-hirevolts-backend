import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';

// Get dashboard statistics
export async function getDashboardStats(req, res) {
  try {
    // Total counts
    const totalCandidates = await Candidate.countDocuments();
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'Open' });
    const closedJobs = await Job.countDocuments({ status: 'Closed' });

    // Candidates by status
    const candidatesByStatus = await Candidate.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Jobs by department
    const jobsByDepartment = await Job.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Recent candidates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCandidates = await Candidate.countDocuments({
      appliedDate: { $gte: thirtyDaysAgo }
    });

    // Active applications (candidates with status != Rejected)
    const activeApplications = await Candidate.countDocuments({
      status: { $ne: 'Rejected' }
    });

    // Candidates by experience level
    const candidatesByExperience = await Candidate.aggregate([
      {
        $bucket: {
          groupBy: '$experience',
          boundaries: [0, 2, 5, 10, 100],
          default: '10+',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Top skills (most common skills across all candidates)
    const topSkills = await Candidate.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      summary: {
        totalCandidates,
        totalJobs,
        openJobs,
        closedJobs,
        recentCandidates,
        activeApplications
      },
      candidatesByStatus: candidatesByStatus.map(item => ({
        status: item._id,
        count: item.count
      })),
      jobsByDepartment: jobsByDepartment.map(item => ({
        department: item._id,
        count: item.count
      })),
      candidatesByExperience: candidatesByExperience.map((item, index) => {
        const labels = ['0-2 years', '2-5 years', '5-10 years', '10+ years'];
        return {
          range: labels[index] || '10+ years',
          count: item.count
        };
      }),
      topSkills: topSkills.map(item => ({
        skill: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
}

// Get recent activities
export async function getRecentActivities(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent candidates
    const recentCandidates = await Candidate.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name position status appliedDate createdAt');

    // Get recent jobs
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title department status postedDate createdAt');

    res.json({
      recentCandidates: recentCandidates.map(c => ({
        id: c._id,
        name: c.name,
        position: c.position,
        status: c.status,
        appliedDate: c.appliedDate,
        type: 'candidate'
      })),
      recentJobs: recentJobs.map(j => ({
        id: j._id,
        title: j.title,
        department: j.department,
        status: j.status,
        postedDate: j.postedDate,
        type: 'job'
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent activities', error: error.message });
  }
}
