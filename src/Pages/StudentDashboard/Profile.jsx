import React, { useMemo, useState, useEffect } from "react";
import defaultProfilePic from "../../assets/defaultProfilePic.png";

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch student profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/student/profile/", {
          credentials: "include", 
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setStudent(data);
        console.log(data);
      } catch (err) {
        console.error(err);
        setStudent(null); // fallback to empty
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const data = student || {};

  const initialPhoto = useMemo(
    () => (data.photo && String(data.photo).trim()) || defaultProfilePic,
    [data.photo]
  );
  const [imgSrc, setImgSrc] = useState(initialPhoto);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  // fallback object if student is null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-5xl p-6 md:p-8">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            Student Profile
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-sm font-semibold text-indigo-700">
              ID No: {data.idNo}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-sm text-gray-700">
              Roll No: {data.rollNo}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 flex flex-col items-center">
            <img
              src={imgSrc}
              alt="Student"
              onError={() => setImgSrc(defaultProfilePic)}
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
            />
            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {data.name}
              </h2>
              <p className="text-sm text-gray-600">
                BATCH {data.batch} • {data.course}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {data.branch} • Section {data.section}  
              </p>
            </div>
          </div>

          <div className="md:w-2/3 space-y-8">
            <Section title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileField label="Name as per 10th" value={data.name} />
                <ProfileField label="Gender" value={data.gender} />
                <ProfileField label="Date of Birth" value={data.dob} />
                <ProfileField label="Blood Group" value={data.bloodGroup} />
                <div className="sm:col-span-2">
                  <ProfileField
                    label="Email"
                    value={
                      data.gmail ? (
                        <a href={`mailto:${data.gmail}`} className="hover:underline break-words">
                          {data.gmail}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>
              </div>
            </Section>

            <Section title="Academic Information">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <ProfileField label="Course" value={data.course} />
                <ProfileField label="Batch" value={data.batch} />
                <ProfileField label="Branch" value={data.branch} />
                <ProfileField label="Section" value={data.section} />
              </div>
            </Section>

            <Section title="Contacts & Family">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileField
                  label="Student Mobile"
                  value={
                    data.studentMobile ? (
                      <a href={`tel:${data.studentMobile}`} className="hover:underline">
                        {data.studentMobile}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <ProfileField
                  label="Parent Mobile"
                  value={
                    data.parentMobile ? (
                      <a href={`tel:${data.parentMobile}`} className="hover:underline">
                        {data.parentMobile}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <ProfileField label="Father's Name" value={data.fatherName} />
                <ProfileField label="Mother's Name" value={data.motherName} />
                <div className="sm:col-span-2">
                  <ProfileField
                    label="Address"
                    value={
                      <span className="whitespace-pre-wrap leading-relaxed">
                        {data.address}
                      </span>
                    }
                  />
                </div>
                
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};


const Section = ({ title, children }) => (
  <section>
    <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      {children}
    </div>
  </section>
);

const ProfileField = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-0.5 font-medium text-gray-900 break-words">{value || "—"}</p>
  </div>
);

export default Profile;
