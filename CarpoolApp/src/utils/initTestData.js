import { 
  createParent, 
  createKid, 
  createSchool,
  getOrCreateTodaysCarpool 
} from '../services/dataService';
import { addCarToCarpool, saveCarpoolChanges } from '../services/carpoolService';

// Test data from your JSON file
const testData = {
  "parents": [
    {
      "id": "P1",
      "name": "Parent A",
      "cars": [
        {
          "plate": "123-45-678",
          "seats": 5,
          "default": true
        }
      ],
      "availability": {
        "Mon": ["morning"],
        "Tue": ["morning"],
        "Wed": ["morning"],
        "Thu": ["morning"]
      },
      "phone": "+97250000001"
    },
    {
      "id": "P2",
      "name": "Parent B",
      "cars": [
        {
          "plate": "234-56-789",
          "seats": 4,
          "default": true
        }
      ],
      "availability": {
        "Tue": ["morning", "afternoon"],
        "Thu": ["morning", "afternoon"]
      },
      "phone": "+97250000002"
    },
    {
      "id": "P3",
      "name": "Parent C",
      "cars": [],
      "availability": {},
      "observer": true,
      "phone": "+97250000003"
    }
  ],
  "kids": [
    {
      "id": "K1",
      "name": "Kid 1",
      "grade": 3,
      "timetable": {
        "morning": "8am",
        "afternoon": "2pm"
      },
      "parent": "P1",
      "phone": "+97251000001"
    },
    {
      "id": "K2",
      "name": "Kid 2",
      "grade": 3,
      "timetable": {
        "morning": "8am",
        "afternoon": "1pm"
      },
      "parent": "P2",
      "phone": "+97251000002"
    },
    {
      "id": "K3",
      "name": "Kid 3",
      "grade": 5,
      "timetable": {
        "morning": "9am",
        "afternoon": "3pm"
      },
      "parent": "P3",
      "phone": "+97251000003"
    }
  ],
  "schools": [
    {
      "id": "S1",
      "name": "Meitarim Raanana",
      "grades": [3, 5]
    }
  ]
};

export const initializeTestData = async () => {
  try {
    console.log('Initializing test data...');

    // Create schools
    for (const school of testData.schools) {
      await createSchool({
        name: school.name,
        grades: school.grades
      });
      console.log(`Created school: ${school.name}`);
    }

    // Create parents
    const parentIds = {};
    for (const parent of testData.parents) {
      const parentData = {
        name: parent.name,
        phone: parent.phone,
        school: 'Meitarim Raanana',
        cars: parent.cars.map(car => ({
          plate: car.plate,
          seats: car.seats,
          isDefault: car.default || false
        })),
        availability: {
          Sunday: { morning: false, afternoon: false },
          Monday: { 
            morning: parent.availability.Mon?.includes('morning') || false,
            afternoon: parent.availability.Mon?.includes('afternoon') || false
          },
          Tuesday: { 
            morning: parent.availability.Tue?.includes('morning') || false,
            afternoon: parent.availability.Tue?.includes('afternoon') || false
          },
          Wednesday: { 
            morning: parent.availability.Wed?.includes('morning') || false,
            afternoon: parent.availability.Wed?.includes('afternoon') || false
          },
          Thursday: { 
            morning: parent.availability.Thu?.includes('morning') || false,
            afternoon: parent.availability.Thu?.includes('afternoon') || false
          }
        },
        role: 'parent',
        isActive: !parent.observer
      };

      const parentId = await createParent(parentData);
      parentIds[parent.id] = parentId;
      console.log(`Created parent: ${parent.name}`);
    }

    // Create kids
    for (const kid of testData.kids) {
      const kidData = {
        name: kid.name,
        phone: kid.phone,
        grade: kid.grade,
        school: 'Meitarim Raanana',
        parentPhone: testData.parents.find(p => p.id === kid.parent)?.phone,
        timetable: kid.timetable,
        role: 'kid',
        isActive: true
      };

      await createKid(kidData);
      console.log(`Created kid: ${kid.name}`);
    }

    // Create a sample carpool for today
    const carpool = await getOrCreateTodaysCarpool();
    
    // Add Parent A's car to Tuesday 8am morning slot
    addCarToCarpool(
      carpool,
      parentIds.P1,
      'Parent A',
      { plate: '123-45-678', seats: 5 },
      '8am',
      'morning'
    );

    // Add Parent B's car to Tuesday 8am morning slot
    addCarToCarpool(
      carpool,
      parentIds.P2,
      'Parent B',
      { plate: '234-56-789', seats: 4 },
      '8am',
      'morning'
    );

    await saveCarpoolChanges(carpool.id, carpool);

    console.log('Test data initialization completed successfully!');
    return { success: true, message: 'Test data created successfully' };

  } catch (error) {
    console.error('Error initializing test data:', error);
    return { success: false, error: error.message };
  }
};

// Function to clear test data (for development purposes)
export const clearTestData = async () => {
  // This would require additional Firebase operations to delete documents
  // For now, you can manually delete from Firebase console
  console.log('Clear test data function not implemented - use Firebase console');
};

