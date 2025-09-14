// src/utils/dummyData.js
export const projects = [
  {
    id: 1,
    title: "Tamil Nadu Mangrove Restoration",
    status: "verified",
    credits: 1000,
    region: "Tamil Nadu",
    image: "/images/mangrove1.jpg",
    description: "Restoration of 500 mangroves covering 20 hectares. Verified by drone data."
  },
  {
    id: 2,
    title: "Kerala Wetland Project",
    status: "pending",
    credits: 0,
    region: "Kerala",
    image: "/images/mangrove2.jpg",
    description: "Wetland plantation project awaiting verification by NCCR."
  },
  {
    id: 3,
    title: "Andhra Coastal Project",
    status: "rejected",
    credits: 0,
    region: "Andhra Pradesh",
    image: "/images/mangrove3.jpg",
    description: "Field data rejected due to incomplete geotagging."
  }
];
