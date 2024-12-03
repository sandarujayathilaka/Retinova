import React, { useCallback, useState } from "react";
import upload from "../assets/icons/upload.svg";
import { useDropzone } from "react-dropzone";

const Prediction = ({ disease, type, confidence }) => {
  return (
    <div className="bg-[#D9D9D9]/60 items-center py-2 flex flex-col rounded gap-1">
      <div className="">
        Disease : <span>{disease}</span>
      </div>
      <div className="">
        Type : <span>{type}</span>
      </div>
      <div className="">
        Confidence : <span>{confidence}</span>
      </div>
    </div>
  );
};

const Diagnose = () => {
  const predictions = [
    {
      disease: "Disease 1",
      type: "Type 1",
      confidence: "80%",
    },
    {
      disease: "Disease 2",
      type: "Type 2",
      confidence: "70%",
    },
    {
      disease: "Disease 3",
      type: "Type 3",
      confidence: "60%",
    },
  ];

  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async acceptedFiles => {
    setLoading(true);
    // Handle the uploaded files
    console.log(acceptedFiles[0]);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      const fileType = file.type;

      // Check if the file is an image
      if (!fileType.startsWith("image/")) {
        setErrorMsg("We're sorry, but the photo you have uploaded is either not supported.");
        setLoading(false);
        return;
      } else {
        setErrorMsg("");
      }

      try {
      } catch (error) {
        setLoading(false);
        console.error("Error uploading featured image:", error);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1, // Allow only one file
  });

  return (
    <div>
      <div className="font-kanit text-4xl font-semibold text-black/70">Diagnosis</div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <div className="p-10 bg-white rounded">
          <div className="" {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div className="border-2 h-[240px] border-dashed rounded flex items-center justify-center flex-col px-10 text-center">
                <img className="size-20" src={upload} />
                <div>Click to upload or drag and drop</div>
                <div>PNG or JPG</div>
              </div>
            )}
          </div>
        </div>

        <div className="p-10 bg-white rounded flex items-center justify-center">
          <img src="https://via.placeholder.com/500" className="size-[250px]" />
        </div>
      </div>

      <div className="mt-10 bg-white flex flex-col justify-self-center p-5 rounded min-w-[500px] md:max-w-[580px]">
        <div className="text-center mb-4 font-inter text-2xl">Prediction</div>
        <div className="gap-4 flex flex-col px-5">
          {predictions.map((prediction, index) => (
            <Prediction key={index} {...prediction} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Diagnose;
