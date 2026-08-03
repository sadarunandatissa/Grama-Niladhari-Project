import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { certificateFields, certificateTypeLabels } from "./CertificateFields";
