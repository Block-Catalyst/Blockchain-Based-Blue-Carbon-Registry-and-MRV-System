const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 MongoDB Connected for seeding...');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Sample users data
const sampleUsers = [
  {
    fullName: 'John Doe',
    email: 'john@greenearthngo.org',
    password: 'password123',
    role: 'field',
    organization: 'Green Earth NGO',
    phone: '9876543210',
    location: 'Chennai, Tamil Nadu',
    userRole: 'Project Manager',
    isVerified: true
  },
  {
    fullName: 'Sarah Wilson',
    email: 'sarah@blueoceantrust.org',
    password: 'password123',
    role: 'field',
    organization: 'Blue Ocean Trust',
    phone: '8765432109',
    location: 'Mumbai, Maharashtra',
    userRole: 'Environmental Coordinator',
    isVerified: true
  },
  {
    fullName: 'Dr. Ravi Kumar',
    email: 'ravi@ecocare.org',
    password: 'password123',
    role: 'field',
    organization: 'EcoCare Foundation',
    phone: '7654321098',
    location: 'Kochi, Kerala',
    userRole: 'Marine Biologist',
    isVerified: true
  },
  {
    fullName: 'Priya Sharma',
    email: 'priya@oceancare.org',
    password: 'password123',
    role: 'field',
    organization: 'OceanCare Foundation',
    phone: '6543210987',
    location: 'Port Blair, Andaman',
    userRole: 'Conservation Officer',
    isVerified: true
  }
];

// Sample projects data (will be created after users)
const createSampleProjects = async (users) => {
  const sampleProjects = [
    {
      name: 'Mangrove Restoration A',
      description: 'Community-led mangrove plantation in coastal zone A with focus on Rhizophora and Avicennia species.',
      organization: 'Green Earth NGO',
      submittedBy: users[0]._id,
      region: 'Chennai Coast',
      area: 50,
      method: 'plantation',
      vintage: 2023,
      status: 'pending',
      credits: 0,
      estimatedCredits: 750,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/blue-carbon-mrv/project1.jpg',
          publicId: 'blue-carbon-mrv/project1',
          description: 'Baseline mangrove area'
        }
      ],
      location: {
        type: 'Point',
        coordinates: [80.2707, 13.0827] // Chennai coordinates
      },
      speciesMix: [
        { species: 'Rhizophora mucronata', percentage: 60 },
        { species: 'Avicennia marina', percentage: 25 },
        { species: 'Bruguiera gymnorhiza', percentage: 15 }
      ],
      tags: ['mangrove', 'coastal', 'plantation'],
      priority: 'high'
    },
    {
      name: 'Coastal Cleanup B',
      description: 'Plastic waste cleanup initiative with local schools and natural regeneration support.',
      organization: 'Blue Ocean Trust',
      submittedBy: users[1]._id,
      region: 'Marina Beach',
      area: 30,
      method: 'natural_regeneration',
      vintage: 2022,
      status: 'approved',
      credits: 800,
      estimatedCredits: 360,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/blue-carbon-mrv/project2.jpg',
          publicId: 'blue-carbon-mrv/project2',
          description: 'Coastal cleanup activity'
        }
      ],
      location: {
        type: 'Point',
        coordinates: [80.2785, 13.0475] // Marina Beach coordinates
      },
      milestones: [
        {
          title: 'Community Engagement',
          description: 'Engage local communities and schools',
          status: 'completed',
          targetDate: new Date('2023-01-15'),
          completedDate: new Date('2023-01-12')
        },
        {
          title: 'Cleanup Activities',
          description: 'Weekly cleanup drives',
          status: 'in_progress',
          targetDate: new Date('2023-12-31')
        }
      ],
      tags: ['cleanup', 'community', 'regeneration'],
      priority: 'medium'
    },
    {
      name: 'Wetland Protection C',
      description: 'Protecting and restoring wetlands in delta region with biodiversity monitoring.',
      organization: 'EcoCare Foundation',
      submittedBy: users[2]._id,
      region: 'Delta Zone',
      area: 20,
      method: 'mixed',
      vintage: 2021,
      status: 'rejected',
      credits: 0,
      estimatedCredits: 270,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/blue-carbon-mrv/project3.jpg',
          publicId: 'blue-carbon-mrv/project3',
          description: 'Delta wetland area'
        }
      ],
      location: {
        type: 'Point',
        coordinates: [76.2673, 9.9312] // Kochi coordinates
      },
      reviewComments: [
        {
          comment: 'Insufficient baseline data provided. Please submit detailed species survey and soil carbon measurements.',
          reviewedBy: null, // Will be set to admin later
          type: 'rejection'
        }
      ],
      tags: ['wetland', 'delta', 'biodiversity'],
      priority: 'low'
    },
    {
      name: 'Coral Reef Revival D',
      description: 'Revival and protection of coral reefs using artificial reef blocks and mangrove buffers.',
      organization: 'OceanCare Foundation',
      submittedBy: users[3]._id,
      region: 'Andaman Islands',
      area: 80,
      method: 'mixed',
      vintage: 2022,
      status: 'verified',
      credits: 2200,
      estimatedCredits: 1080,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/blue-carbon-mrv/coral1.jpg',
          publicId: 'blue-carbon-mrv/coral1',
          description: 'Coral reef restoration site'
        }
      ],
      location: {
        type: 'Point',
        coordinates: [92.7265, 11.7401] // Port Blair coordinates
      },
      verificationData: {
        verifiedAt: new Date('2023-06-15'),
        verificationMethod: 'drone',
        confidence: 95
      },
      carbonData: {
        soilCarbon: 1200,
        biomassCarbon: 800,
        totalCarbon: 2000,
        carbonPerHectare: 25,
        measurementDate: new Date('2023-06-10'),
        measurementMethod: 'Field sampling and drone imagery'
      },
      biodiversityMetrics: {
        speciesCount: 45,
        endemicSpecies: 8,
        threatenedSpecies: 3,
        surveyDate: new Date('2023-06-12')
      },
      socialImpact: {
        communitiesInvolved: 5,
        jobsCreated: 25,
        beneficiaries: 150,
        genderDistribution: {
          male: 80,
          female: 60,
          other: 10
        }
      },
      tags: ['coral', 'reef', 'marine', 'islands'],
      priority: 'critical'
    },
    {
      name: 'Salt Marsh Protection E',
      description: 'Community-driven effort to conserve salt marshes and restore biodiversity in the delta region.',
      organization: 'EcoDelta Trust',
      submittedBy: users[2]._id,
      region: 'Sundarbans',
      area: 100,
      method: 'natural_regeneration',
      vintage: 2021,
      status: 'approved',
      credits: 950,
      estimatedCredits: 1200,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/blue-carbon-mrv/saltmarsh1.jpg',
          publicId: 'blue-carbon-mrv/saltmarsh1',
          description: 'Salt marsh conservation area'
        }
      ],
              location: {
        type: 'Point',
        coordinates: [88.8644, 21.9497] // Sundarbans coordinates
      },
      milestones: [
        {
          title: 'Baseline Survey',
          description: 'Complete biodiversity and carbon baseline survey',
          status: 'completed',
          targetDate: new Date('2022-03-01'),
          completedDate: new Date('2022-02-28')
        },
        {
          title: 'Community Training',
          description: 'Train local communities in conservation practices',
          status: 'completed',
          targetDate: new Date('2022-06-01'),
          completedDate: new Date('2022-05-15')
        },
        {
          title: 'Monitoring Setup',
          description: 'Establish long-term monitoring system',
          status: 'in_progress',
          targetDate: new Date('2024-01-01')
        }
      ],
      tags: ['saltmarsh', 'sundarbans', 'community'],
      priority: 'high'
    },
    {
      name: 'Wetland Restoration F',
      description: 'Wetland mangrove replantation program combining local traditional knowledge with satellite monitoring.',
      organization: 'Blue Carbon Collective',
      submittedBy: users[2]._id,
      region: 'Kerala Backwaters',
      area: 40,
      method: 'plantation',
      vintage: 2023,
      status: 'pending',
      credits: 0,
      estimatedCredits: 600,
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/blue-carbon-mrv/wetland1.jpg',
          publicId: 'blue-carbon-mrv/wetland1',
          description: 'Kerala backwater restoration site'
        }
      ],
      location: {
        type: 'Point',
        coordinates: [76.2673, 9.9312] // Kerala backwaters coordinates
      },
      speciesMix: [
        { species: 'Rhizophora apiculata', percentage: 40 },
        { species: 'Avicennia officinalis', percentage: 35 },
        { species: 'Kandelia candel', percentage: 25 }
      ],
      tags: ['wetland', 'backwaters', 'traditional-knowledge'],
      priority: 'medium'
    }
  ];

  return sampleProjects;
};

// Seed function
const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create projects
    console.log('📋 Creating sample projects...');
    const sampleProjects = await createSampleProjects(createdUsers);
    
    // Update submittedBy references to use actual user IDs
    const projectsWithUserIds = sampleProjects.map(project => ({
      ...project,
      submittedBy: createdUsers[sampleUsers.findIndex(user => user.organization === project.organization)]._id
    }));

    const createdProjects = await Project.create(projectsWithUserIds);
    console.log(`✅ Created ${createdProjects.length} projects`);

    // Update users with their project references
    console.log('🔗 Linking projects to users...');
    for (let i = 0; i < createdUsers.length; i++) {
      const userProjects = createdProjects.filter(project => 
        project.submittedBy.toString() === createdUsers[i]._id.toString()
      );
      
      const totalCredits = userProjects.reduce((sum, project) => sum + project.credits, 0);
      const totalArea = userProjects.reduce((sum, project) => sum + project.area, 0);
      
      await User.findByIdAndUpdate(createdUsers[i]._id, {
        projects: userProjects.map(p => p._id),
        totalCredits,
        totalArea
      });
    }

    // Add some additional milestones and comments
    console.log('📝 Adding additional data...');
    
    // Add review comments to some projects
    const pendingProject = createdProjects.find(p => p.status === 'pending');
    if (pendingProject) {
      pendingProject.reviewComments = [
        {
          comment: 'Project looks promising. Please provide additional soil carbon measurements for baseline.',
          reviewedBy: createdUsers[0]._id,
          type: 'revision_request'
        }
      ];
      await pendingProject.save();
    }

    console.log('✨ Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users created: ${createdUsers.length}`);
    console.log(`   Projects created: ${createdProjects.length}`);
    console.log('\n🔐 Test login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Field User: john@greenearthngo.org / password123');
    console.log('   Field User: sarah@blueoceantrust.org / password123');
    console.log('   Field User: ravi@ecocare.org / password123');
    console.log('   Field User: priya@oceancare.org / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Additional function to add more realistic data
const addRealisticData = async () => {
  try {
    console.log('🎯 Adding realistic timeline data...');
    
    const projects = await Project.find({});
    
    for (const project of projects) {
      // Add realistic created dates (spread over last 2 years)
      const randomDaysAgo = Math.floor(Math.random() * 730); // 2 years
      project.createdAt = new Date(Date.now() - (randomDaysAgo * 24 * 60 * 60 * 1000));
      
      // Add some realistic GeoJSON data for approved projects
      if (project.status === 'approved' || project.status === 'verified') {
        project.geoData = {
          type: 'Feature',
          properties: {
            name: project.name,
            area: project.area,
            method: project.method
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [project.location.coordinates[0] - 0.01, project.location.coordinates[1] - 0.01],
              [project.location.coordinates[0] + 0.01, project.location.coordinates[1] - 0.01],
              [project.location.coordinates[0] + 0.01, project.location.coordinates[1] + 0.01],
              [project.location.coordinates[0] - 0.01, project.location.coordinates[1] + 0.01],
              [project.location.coordinates[0] - 0.01, project.location.coordinates[1] - 0.01]
            ]]
          }
        };
      }
      
      await project.save();
    }
    
    console.log('✅ Realistic data added successfully');
    
  } catch (error) {
    console.error('❌ Error adding realistic data:', error);
  }
};

// Run seeding
const run = async () => {
  await connectDB();
  await seedData();
  
  // Optionally add more realistic data
  if (process.argv.includes('--realistic')) {
    await connectDB();
    await addRealisticData();
  }
};

// Handle command line execution
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { seedData, addRealisticData };