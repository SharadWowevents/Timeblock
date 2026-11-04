export default function PrivacyPolicyAgreement({ checked, onChange, required = false }) {
  return (
    <div className="privacy-policy">
      <p>
        Timeblock uses your email and password to manage your account. Passwords are stored
        as hashes. Your schedule, tasks, categories, and bookmarks are stored with your
        account to provide the service. Account data is removed when the account is deleted.
      </p>
      <label className="privacy-policy-checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          required={required}
        />
        <span>I have read and agree to the Privacy Policy.</span>
      </label>
    </div>
  );
}
