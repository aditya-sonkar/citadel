"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAM_ACTIONS = void 0;
exports.IAM_ACTIONS = {
    // Policies
    LIST_POLICIES: 'iam:ListPolicies',
    GET_POLICY: 'iam:GetPolicy',
    CREATE_POLICY: 'iam:CreatePolicy',
    UPDATE_POLICY: 'iam:UpdatePolicy',
    DELETE_POLICY: 'iam:DeletePolicy',
    // Groups
    LIST_GROUPS: 'iam:ListGroups',
    GET_GROUP: 'iam:GetGroup',
    CREATE_GROUP: 'iam:CreateGroup',
    UPDATE_GROUP: 'iam:UpdateGroup',
    DELETE_GROUP: 'iam:DeleteGroup',
    ADD_USER_TO_GROUP: 'iam:AddUserToGroup',
    REMOVE_USER_FROM_GROUP: 'iam:RemoveUserFromGroup',
    ATTACH_GROUP_POLICY: 'iam:AttachGroupPolicy',
    DETACH_GROUP_POLICY: 'iam:DetachGroupPolicy',
    // Users
    LIST_USERS: 'iam:ListUsers',
    GET_USER: 'iam:GetUser',
    DELETE_USER: 'iam:DeleteUser',
    ATTACH_USER_POLICY: 'iam:AttachUserPolicy',
    DETACH_USER_POLICY: 'iam:DetachUserPolicy',
    PUT_USER_BOUNDARY: 'iam:PutUserBoundary',
    DELETE_USER_BOUNDARY: 'iam:DeleteUserBoundary',
    GET_CREDENTIAL_REPORT: 'iam:GetCredentialReport',
    // Audit Logs
    LIST_AUDIT_LOGS: 'iam:ListAuditLogs',
    GET_AUDIT_LOG: 'iam:GetAuditLog',
    // Evaluate
    EVALUATE_POLICY: 'iam:EvaluatePolicy',
};
